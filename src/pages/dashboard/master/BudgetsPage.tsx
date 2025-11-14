import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Copy, FileText, Loader2, CalendarDays, Mail, Phone, MapPin, DollarSign, Download, Eye, X, MessageCircle, User, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { format, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para gerar senhas temporárias

// Tipos de dados para Serviços (products)
interface ServiceItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  final_price: number;
  initial_delivery_days: number | null; // Adicionado para cálculo de prazo
}

// Tipos de dados para Pacotes
interface PackageItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number; // Preço mensal final calculado (já com o desconto do pacote)
  services_in_package?: ServiceItem[]; // Serviços incluídos no pacote
}

// Tipos de dados para Itens do Orçamento
interface BudgetItem {
  id: string;
  budget_id: string;
  service_id: string | null;
  package_id: string | null;
  item_type: 'service' | 'package';
  item_name: string;
  item_description: string | null;
  item_price: number;
  created_at: string;
}

// Tipos de dados para Orçamento
interface Budget {
  id: string;
  user_id: string;
  proposal_number: string; // NOVO: Número da proposta
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  client_street: string | null; // NOVO
  client_number: string | null; // NOVO
  client_complement: string | null; // NOVO
  client_neighborhood: string | null; // NOVO
  client_city: string | null; // NOVO
  client_state: string | null; // NOVO
  client_cep: string | null;
  valid_until: string;
  total_amount: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted'; // Adicionado status
  approved_at: string | null; // Adicionado data de aprovação
  budget_items: BudgetItem[];
}

interface InstallmentRate {
  installments: number;
  merchant_pays_rate: number;
  client_pays_rate: number;
}

// NOVO: Interface para o perfil do cliente (combinando profiles e auth.users)
interface ClientProfile {
  id: string;
  client_id: string | null; // NOVO: Adicionado client_id
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
}

// Função para gerar uma senha temporária
const generateTemporaryPassword = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12); // 12 caracteres alfanuméricos
};

// Função para dividir o nome completo em primeiro e último nome
const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export default function BudgetsPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Budget> & { client_first_name?: string; client_last_name?: string }>({
    client_first_name: '', // NOVO
    client_last_name: '',  // NOVO
    client_phone: '',
    client_email: '',
    client_street: '',
    client_number: '',
    client_complement: '',
    client_neighborhood: '',
    client_city: '',
    client_state: '',
    client_cep: '',
  });
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; type: 'service' | 'package'; name: string; description: string | null; price: number }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const [currentEditableBudget, setCurrentEditableBudget] = useState<Budget | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null); // NOVO: Estado para o cliente selecionado

  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false); // Estado para o pop-up de confirmação de aprovação
  const [budgetToApprove, setBudgetToApprove] = useState<Budget | null>(null); // Orçamento a ser aprovado

  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false); // NOVO: Estado para o pop-up de confirmação de reversão
  const [budgetToRevert, setBudgetToRevert] = useState<Budget | null>(null); // NOVO: Orçamento a ser revertido

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // NOVO: Estado para o pop-up de confirmação de exclusão
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null); // NOVO: Orçamento a ser excluído

  // Helper function for badge styling
  const getBudgetStatusBadgeVariant = (status: Budget['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'approved': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'rejected': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'converted': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  // Fetch all services
  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceItem[], Error>({
    queryKey: ['allServices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('id, sku, name, description, final_price, initial_delivery_days').order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all packages with their services
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery<any[], Error>({
    queryKey: ['allPackages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          id,
          sku,
          name,
          description,
          price,
          package_services(
            service_id
          )
        `)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all budgets with their items
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[], Error>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          user_id,
          proposal_number,
          client_name,
          client_phone,
          client_email,
          client_street,
          client_number,
          client_complement,
          client_neighborhood,
          client_city,
          client_state,
          client_cep,
          valid_until,
          total_amount,
          created_at,
          status,
          approved_at,
          budget_items(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch default cash discount percentage from settings
  const { data: defaultCashDiscountSetting, isLoading: isLoadingCashDiscount } = useQuery<{ key: string; value: number } | null, Error>({
    queryKey: ['settings', 'default_cash_discount_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'default_cash_discount_percentage')
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    staleTime: Infinity,
  });

  // Fetch annual package discount percentage from settings
  const { data: annualDiscountSetting, isLoading: isLoadingAnnualDiscount } = useQuery<{ key: string; value: number } | null, Error>({
    queryKey: ['settings', 'annual_package_discount_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'annual_package_discount_percentage')
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    staleTime: Infinity, // This setting doesn't change often
  });

  // Fetch installment rates
  const { data: installmentRates, isLoading: isLoadingRates } = useQuery<InstallmentRate[], Error>({
    queryKey: ['installment_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installment_rates')
        .select('*')
        .order('installments', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });

  // Fetch WhatsApp contact number from settings
  const { data: whatsappNumberSetting, isLoading: isLoadingWhatsappNumber } = useQuery<{ key: string; value: string } | null, Error>({
    queryKey: ['settings', 'whatsapp_contact_number'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'whatsapp_contact_number')
        .single();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    staleTime: Infinity,
  });
  const whatsappContactNumber = whatsappNumberSetting?.value || '';

  // Fetch client profiles (without email initially)
  const { data: clientProfilesData, isLoading: isLoadingClientProfilesData } = useQuery<Omit<ClientProfile, 'email'>[], Error>({
    queryKey: ['clientProfilesData'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          client_id,
          first_name,
          last_name,
          telefone,
          role
        `)
        .eq('role', 'client');

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: user?.id !== undefined,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch emails for client profiles via Edge Function
  const { data: clientEmailsMap, isLoading: isLoadingClientEmails } = useQuery<Record<string, string>, Error>({
    queryKey: ['clientProfileEmails', clientProfilesData?.map(p => p.id)],
    queryFn: async ({ queryKey }) => {
      const userIds = queryKey[1] as string[];
      if (!userIds || userIds.length === 0) return {};

      const { data, error } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });

      if (error) throw error;
      return data as Record<string, string>;
    },
    enabled: !!clientProfilesData && clientProfilesData.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Combine client profiles with emails
  const clientProfiles = useMemo(() => {
    if (!clientProfilesData) return [];
    return clientProfilesData.map(profile => ({
      ...profile,
      email: clientEmailsMap?.[profile.id] || 'N/A',
    }));
  }, [clientProfilesData, clientEmailsMap]);

  // Combine packagesData with availableServices on the client side for full package details
  const allPackages = useMemo(() => {
    if (!packagesData || !services) return [];
    const servicesMap = new Map(services.map(s => [s.id, s]));

    return packagesData.map(pkg => {
      const servicesInPackage = pkg.package_services
        .map((ps: { service_id: string }) => servicesMap.get(ps.service_id))
        .filter(Boolean) as ServiceItem[];
      return {
        ...pkg,
        services_in_package: servicesInPackage,
      };
    });
  }, [packagesData, services]);

  const allAvailableItems = useMemo(() => {
    const items: Array<{ id: string; type: 'service' | 'package'; name: string; description: string | null; price: number; sku: string }> = [];
    services?.forEach(s => items.push({ id: s.id, type: 'service', name: s.name, description: s.description, price: s.final_price, sku: s.sku }));
    allPackages?.forEach(p => items.push({ id: p.id, type: 'package', name: p.name, description: p.description, price: p.price, sku: p.sku }));
    return items;
  }, [services, allPackages]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  // Determine the type of items already selected (if any)
  const currentSelectionType = useMemo(() => {
    if (selectedItems.length > 0) {
      return selectedItems[0].type;
    }
    return null;
  }, [selectedItems]);

  const filteredAvailableItems = useMemo(() => {
    let itemsToFilter = allAvailableItems;

    // Apply type filtering based on current selection
    if (currentSelectionType) {
      itemsToFilter = itemsToFilter.filter(item => item.type === currentSelectionType);
    }

    // Apply search term filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      itemsToFilter = itemsToFilter.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.sku.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return itemsToFilter;
  }, [searchTerm, allAvailableItems, currentSelectionType]);

  // --- CÁLCULOS PARA OPÇÕES DE PAGAMENTO ---
  const cashDiscountPercentage = useMemo(() => defaultCashDiscountSetting?.value || 10, [defaultCashDiscountSetting]);

  const valorAVistaComDesconto = useMemo(() => {
    if (totalAmount === 0) return 0;
    return parseFloat((totalAmount * (1 - cashDiscountPercentage / 100)).toFixed(2));
  }, [totalAmount, cashDiscountPercentage]);

  const getInstallmentDetails = useCallback((installments: number) => {
    if (totalAmount === 0 || !installmentRates) return { total: 0, parcela: 0, taxa: 0 };

    let effectiveClientRate = 0;
    let totalComJuros = totalAmount; // Começa com o valor total, sem juros

    // Cliente paga juros apenas para parcelas de 7 a 10
    if (installments >= 7 && installments <= 10) {
      const rate = installmentRates.find(r => r.installments === installments);
      effectiveClientRate = rate ? rate.client_pays_rate : 0;
      totalComJuros = totalAmount * (1 + effectiveClientRate);
    }
    // Para parcelas <= 6, effectiveClientRate permanece 0, então totalComJuros é igual a totalAmount.

    const valorParcela = totalComJuros / installments;

    return {
      total: parseFloat(totalComJuros.toFixed(2)),
      parcela: parseFloat(valorParcela.toFixed(2)),
      taxa: parseFloat((effectiveClientRate * 100).toFixed(2)),
    };
  }, [totalAmount, installmentRates]);

  const parcelamento6x = useMemo(() => getInstallmentDetails(6), [getInstallmentDetails]);
  const parcelamento10x = useMemo(() => getInstallmentDetails(10), [getInstallmentDetails]);

  // Cálculos para pacotes (Mensal e Anual)
  const packageAnnualDiscountPercentage = useMemo(() => annualDiscountSetting?.value || 10, [annualDiscountSetting]);

  const packageMonthlyPrice = useMemo(() => totalAmount, [totalAmount]); // Para pacotes, totalAmount é o valor mensal

  const packageAnnualPriceWithDiscount = useMemo(() => {
    if (packageMonthlyPrice === 0) return 0;
    const annualRaw = packageMonthlyPrice * 12;
    return parseFloat((annualRaw * (1 - packageAnnualDiscountPercentage / 100)).toFixed(2));
  }, [packageMonthlyPrice, packageAnnualDiscountPercentage]);

  const packageMonthlyPriceFromAnnual = useMemo(() => {
    if (packageAnnualPriceWithDiscount === 0) return 0;
    return parseFloat((packageAnnualPriceWithDiscount / 12).toFixed(2));
  }, [packageAnnualPriceWithDiscount]);
  // --- FIM DOS CÁLCULOS ---

  const calculateValidUntil = () => {
    let currentDate = new Date();
    let businessDaysToAdd = 5;
    let count = 0;
    while (count < businessDaysToAdd) {
      currentDate = addBusinessDays(currentDate, 1);
      count++;
    }
    return format(currentDate, 'yyyy-MM-dd');
  };

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ''); // Remove tudo que não é dígito
    let formatted = '';

    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) { // (00) 0000
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 10) { // (00) 0000-0000 (fixo)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length <= 11) { // (00) 00000-0000 (celular)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    } else {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`; // Limita a 11 dígitos
    }
    return formatted;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'client_cep') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCep(value),
      }));
    } else if (name === 'client_phone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggleItem = (itemToToggle: { id: string; type: 'service' | 'package'; name: string; description: string | null; price: number; sku: string }) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.id === itemToToggle.id && item.type === itemToToggle.type);

      if (isSelected) {
        // If already selected, remove it
        return prev.filter(item => !(item.id === itemToToggle.id && item.type === itemToToggle.type));
      } else {
        // If not selected, add it, but check for type consistency
        if (prev.length > 0 && prev[0].type !== itemToToggle.type) {
          toast.error(`Um orçamento não pode conter serviços e pacotes. Por favor, selecione apenas um tipo.`);
          return prev; // Prevent adding
        }
        return [...prev, {
          id: itemToToggle.id,
          type: itemToToggle.type,
          name: itemToToggle.name,
          description: itemToToggle.description,
          price: itemToToggle.price,
        }];
      }
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenDialog = (budgetToDuplicate?: Budget) => {
    if (budgetToDuplicate) {
      const { firstName, lastName } = splitFullName(budgetToDuplicate.client_name);
      setFormData({
        client_first_name: firstName,
        client_last_name: lastName,
        client_phone: budgetToDuplicate.client_phone,
        client_email: budgetToDuplicate.client_email,
        client_street: budgetToDuplicate.client_street,
        client_number: budgetToDuplicate.client_number,
        client_complement: budgetToDuplicate.client_complement,
        client_neighborhood: budgetToDuplicate.client_neighborhood,
        client_city: budgetToDuplicate.client_city,
        client_state: budgetToDuplicate.client_state,
        client_cep: budgetToDuplicate.client_cep,
      });
      setSelectedItems(budgetToDuplicate.budget_items.map(item => ({
        id: item.service_id || item.package_id || '',
        type: item.item_type,
        name: item.item_name,
        description: item.item_description,
        price: item.item_price,
      })));
      setSelectedClientId(budgetToDuplicate.user_id); // Pre-select client if duplicating
      setCurrentEditableBudget(budgetToDuplicate); 
    } else {
      setFormData({
        client_first_name: '',
        client_last_name: '',
        client_phone: '',
        client_email: '',
        client_street: '',
        client_number: '',
        client_complement: '',
        client_neighborhood: '',
        client_city: '',
        client_state: '',
        client_cep: '',
      });
      setSelectedItems([]);
      setSelectedClientId(null); // Clear selected client for new budget
      setCurrentEditableBudget(null); // Clear for new budget
    }
    setIsDialogOpen(true);
  };

  // NOVO: Função para lidar com a seleção de um cliente existente
  const handleClientSelect = (clientId: string) => {
    if (clientId === 'new') {
      setSelectedClientId(null);
      setFormData(prev => ({
        ...prev,
        client_first_name: '',
        client_last_name: '',
        client_phone: '',
        client_email: '',
        client_street: '',
        client_number: '',
        client_complement: '',
        client_neighborhood: '',
        client_city: '',
        client_state: '',
        client_cep: '',
      }));
    } else {
      const client = clientProfiles?.find(p => p.id === clientId);
      if (client) {
        setSelectedClientId(clientId);
        setFormData(prev => ({
          ...prev,
          client_first_name: client.first_name || '',
          client_last_name: client.last_name || '',
          client_phone: client.telefone || '',
          client_email: client.email || '',
          // Endereço não está no perfil, então não preenche
          client_street: '',
          client_number: '',
          client_complement: '',
          client_neighborhood: '',
          client_city: '',
          client_state: '',
          client_cep: '',
        }));
      }
    }
  };

  const saveBudgetMutation = useMutation<Budget, Error, { budgetData: Partial<Budget> & { client_first_name?: string; client_last_name?: string }; items: typeof selectedItems }>({
    mutationFn: async ({ budgetData, items }) => {
      if (!user) throw new Error("Usuário não autenticado.");

      let finalUserId = selectedClientId;
      const fullClientName = `${budgetData.client_first_name || ''} ${budgetData.client_last_name || ''}`.trim();

      if (!finalUserId) { // Se nenhum cliente existente for selecionado, crie um novo
        if (!budgetData.client_email || !budgetData.client_first_name) { // Apenas first_name é obrigatório para novo usuário
          throw new Error("E-mail e nome do cliente são obrigatórios para criar um novo usuário.");
        }

        const tempPassword = generateTemporaryPassword();
        const userMetadata = {
          first_name: budgetData.client_first_name,
          last_name: budgetData.client_last_name || null,
          telefone: budgetData.client_phone || null,
        };

        // Chamar a Edge Function para criar o usuário sem verificação
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-unverified-user', {
          body: {
            email: budgetData.client_email,
            password: tempPassword,
            user_metadata: userMetadata,
          },
        });

        if (edgeFunctionError) {
          let specificErrorMessage = "Erro desconhecido ao criar novo usuário.";
          try {
            // A edgeFunctionError.message frequentemente contém o corpo da resposta bruta como uma string
            const parsedResponse = JSON.parse(edgeFunctionError.message);
            if (parsedResponse && parsedResponse.error) {
              specificErrorMessage = parsedResponse.error;
            }
          } catch (parseError) {
            // Se não for uma string JSON, usa a mensagem original
            specificErrorMessage = edgeFunctionError.message;
          }
          throw new Error(`Falha ao criar novo usuário: ${specificErrorMessage}`);
        }
        if (!edgeFunctionData || !edgeFunctionData.userId) {
          throw new Error("Falha ao criar novo usuário: Edge Function não retornou ID do usuário.");
        }

        finalUserId = edgeFunctionData.userId;
        toast.info(`Novo usuário '${budgetData.client_email}' criado com sucesso! O cliente precisará redefinir a senha através do link de confirmação de e-mail.`);
      }

      const validUntil = calculateValidUntil();
      const total = items.reduce((sum, item) => sum + item.price, 0);

      const { data: newBudgetResult, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: finalUserId, // Usa o ID do cliente recém-criado ou selecionado
          client_name: fullClientName, // Usa o nome completo construído
          client_phone: formData.client_phone,
          client_email: formData.client_email,
          client_street: formData.client_street,
          client_number: formData.client_number,
          client_complement: formData.client_complement,
          client_neighborhood: formData.client_neighborhood,
          client_city: formData.client_city,
          client_state: formData.client_state,
          client_cep: formData.client_cep,
          valid_until: validUntil,
          total_amount: total,
          status: 'pending', // Novo orçamento sempre começa como pendente
        })
        .select('*')
        .single();

      if (budgetError) throw budgetError;
      if (!newBudgetResult) throw new Error("Falha ao criar orçamento.");

      const budgetItemsToInsert = items.map(item => ({
        budget_id: newBudgetResult.id,
        service_id: item.type === 'service' ? item.id : null,
        package_id: item.type === 'package' ? item.id : null,
        item_type: item.type,
        item_name: item.name,
        item_description: item.description,
        item_price: item.price,
      }));

      const { error: itemsError } = await supabase.from('budget_items').insert(budgetItemsToInsert);
      if (itemsError) throw itemsError;

      return newBudgetResult as Budget;
    },
    onError: (err: any) => { // Usar 'any' para inspecionar a estrutura do erro
      console.error("Erro completo da mutação:", err);

      let userCreationErrorMessage = "Erro desconhecido ao criar novo usuário.";

      // Tenta extrair a mensagem de erro da resposta da Edge Function
      // Agora, err.message já deve conter a mensagem mais específica da Edge Function
      if (err && err.message) {
        userCreationErrorMessage = err.message;
      } else {
        userCreationErrorMessage = `Erro ao criar usuário: ${String(err)}`;
      }

      toast.error(`Erro ao salvar orçamento: ${userCreationErrorMessage}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_first_name || selectedItems.length === 0) { // Apenas first_name é obrigatório
      toast.error('Nome do cliente e pelo menos um item são obrigatórios.');
      return;
    }
    if (!formData.client_email && !selectedClientId) {
      toast.error('E-mail do cliente é obrigatório para novos cadastros.');
      return;
    }
    saveBudgetMutation.mutate({ budgetData: formData, items: selectedItems });
  };

  const generatePdfContent = async (budget: Budget, annualDiscountSetting: { key: string; value: number } | null | undefined, whatsappNumber: string) => {
    const clientAddressFull = [
      budget.client_street,
      budget.client_number ? `, ${budget.client_number}` : '',
      budget.client_complement ? ` - ${budget.client_complement}` : '',
      budget.client_neighborhood ? ` - ${budget.client_neighborhood}` : '',
      budget.client_city ? ` - ${budget.client_city}` : '',
      budget.client_state ? `/${budget.client_state}` : '',
      budget.client_cep ? ` - CEP: ${budget.client_cep}` : '',
    ].filter(Boolean).join('');

    const pdfTotalAmount = budget.total_amount;
    const isPackageBudget = budget.budget_items.length > 0 && budget.budget_items[0].item_type === 'package';

    let paymentOptionsHtml = '';

    if (isPackageBudget) {
      const pdfPackageAnnualDiscountPercentage = annualDiscountSetting?.value || 10;
      const pdfPackageMonthlyPrice = pdfTotalAmount;
      const pdfPackageAnnualRaw = pdfPackageMonthlyPrice * 12;
      const pdfPackageAnnualPriceWithDiscount = parseFloat((pdfPackageAnnualRaw * (1 - pdfPackageAnnualDiscountPercentage / 100)).toFixed(2));
      const pdfPackageMonthlyPriceFromAnnual = parseFloat((pdfPackageAnnualPriceWithDiscount / 12).toFixed(2));

      paymentOptionsHtml = `
        <p style="font-size: 16px; text-align: right; margin-top: 20px;"><strong>Valor Mensal: R$ ${pdfPackageMonthlyPrice.toFixed(2)}</strong></p>
        <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Anual (${pdfPackageAnnualDiscountPercentage}% de desconto): R$ ${pdfPackageAnnualPriceWithDiscount.toFixed(2)}</strong></p>
        <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Mensal (Pacote Anual): R$ ${pdfPackageMonthlyPriceFromAnnual.toFixed(2)}</strong></p>
      `;
    } else {
      const pdfCashDiscountPercentage = defaultCashDiscountSetting?.value || 10;
      const pdfValorAVistaComDesconto = parseFloat((pdfTotalAmount * (1 - pdfCashDiscountPercentage / 100)).toFixed(2));

      const getPdfInstallmentDetails = (installments: number) => {
        if (pdfTotalAmount === 0 || !installmentRates) return { total: 0, parcela: 0, taxa: 0 };
        
        let effectiveClientRate = 0;
        let totalComJuros = pdfTotalAmount;

        if (installments >= 7 && installments <= 10) {
          const rate = installmentRates.find(r => r.installments === installments);
          effectiveClientRate = rate ? rate.client_pays_rate : 0;
          totalComJuros = pdfTotalAmount * (1 + effectiveClientRate);
        }

        const valorParcela = totalComJuros / installments;

        return {
          total: parseFloat(totalComJuros.toFixed(2)),
          parcela: parseFloat(valorParcela.toFixed(2)),
          taxa: parseFloat((effectiveClientRate * 100).toFixed(2)),
        };
      };

      const pdfParcelamento6x = getPdfInstallmentDetails(6);
      const pdfParcelamento10x = getPdfInstallmentDetails(10);

      paymentOptionsHtml = `
        <p style="font-size: 16px; text-align: right; margin-top: 20px;"><strong>Valor Total: R$ ${pdfTotalAmount.toFixed(2)}</strong></p>
        <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor à Vista (${pdfCashDiscountPercentage}% de desconto): R$ ${pdfValorAVistaComDesconto.toFixed(2)}</strong></p>
        <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Parcelado em até 6x (sem juros): 6x de R$ ${pdfParcelamento6x.parcela.toFixed(2)} (Total: R$ ${pdfParcelamento6x.total.toFixed(2)})</strong></p>
        <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Parcelado em até 10x (com juros): 10x de R$ ${pdfParcelamento10x.parcela.toFixed(2)} (Total: R$ ${pdfParcelamento10x.total.toFixed(2)})</strong></p>
      `;
    }

    const cleanedWhatsappNumber = whatsappNumber.replace(/\D/g, ''); // Remove non-digits for the link
    const whatsappCtaHtml = cleanedWhatsappNumber ? `
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://wa.me/55${cleanedWhatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20a%20proposta%20${budget.proposal_number}." 
           target="_blank" 
           rel="noopener noreferrer"
           style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.4);">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 10px;">
          Fale Conosco no WhatsApp
        </a>
      </div>
    ` : '';

    return `
      <div style="font-family: 'Poppins', sans-serif; padding: 40px; color: #0D1B2A; background-color: #ffffff; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp" alt="Pontedra Logo" style="max-height: 80px; width: auto;">
        </div>
        <h1 style="font-size: 28px; color: #00C896; text-align: center; margin-bottom: 20px;">PROPOSTA COMERCIAL</h1>
        <p style="font-size: 14px; text-align: center; color: #555; margin-bottom: 10px;">Número da Proposta: <strong>${budget.proposal_number}</strong></p>
        <p style="font-size: 14px; text-align: center; color: #555; margin-bottom: 30px;">Gerado em: ${format(new Date(budget.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>

        <div style="border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px; background-color: #f9f9f9;">
          <h2 style="font-size: 20px; color: #0D1B2A; margin-bottom: 15px;">Dados do Cliente</h2>
          <p style="font-size: 14px; margin-bottom: 5px;"><strong>Nome:</strong> ${budget.client_name}</p>
          ${budget.client_email ? `<p style="font-size: 14px; margin-bottom: 5px;"><strong>E-mail:</strong> ${budget.client_email}</p>` : ''}
          ${budget.client_phone ? `<p style="font-size: 14px; margin-bottom: 5px;"><strong>Telefone:</strong> ${budget.client_phone}</p>` : ''}
          ${clientAddressFull ? `<p style="font-size: 14px; margin-bottom: 5px;"><strong>Endereço:</strong> ${clientAddressFull}</p>` : ''}
        </div>

        <div style="border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px; background-color: #f9f9f9;">
          <h2 style="font-size: 20px; color: #0D1B2A; margin-bottom: 15px;">Itens da Proposta</h2>
          <table width="100%" cellspacing="0" cellpadding="10" style="font-size: 14px; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #e0ffe0;">
                <th style="text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="text-align: left; border: 1px solid #ddd;">Descrição</th>
                <th style="text-align: right; border: 1px solid #ddd;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${budget.budget_items.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd;">${item.item_name} (${item.item_type === 'service' ? 'Serviço' : 'Pacote'})</td>
                  <td style="border: 1px solid #ddd;">
                    ${item.item_description || 'N/A'}
                    ${item.item_type === 'package' ? `
                      <ul style="margin-top: 5px; padding-left: 20px; list-style-type: disc;">
                        ${allPackages.find(p => p.id === item.package_id)?.services_in_package?.map(s => `<li>${s.name}</li>`).join('') || ''}
                      </ul>
                    ` : ''}
                  </td>
                  <td style="text-align: right; border: 1px solid #ddd;">R$ ${item.item_price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${paymentOptionsHtml}
        </div>

        <div style="text-align: center; margin-bottom: 30px; padding: 15px; background-color: #e0ffe0; border-radius: 8px;">
          <p style="font-size: 14px; color: #0D1B2A;"><strong>Validade da Proposta:</strong> ${format(new Date(budget.valid_until), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>

        ${whatsappCtaHtml}

        <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="margin-bottom: 5px;"><strong>Pontedra</strong></p>
          <p style="margin-bottom: 5px;">E-mail: contato@pontedra.com</p>
          <p>Telefone: +55 11 97877-7308</p>
        </div>
      </div>
    `;
  };

  const handlePdfAction = async (budgetFromTable: Budget | null, action: 'download' | 'view') => {
    let budgetToUse: Budget | null = null;

    if (budgetFromTable) {
      // If generating PDF from a saved budget in the table
      budgetToUse = budgetFromTable;
    } else if (currentEditableBudget) {
      // If generating PDF from a newly saved budget in the dialog
      budgetToUse = currentEditableBudget;
    } else {
      // If not saved, create a temporary budget from form data
      if (!formData.client_first_name || selectedItems.length === 0) {
        toast.error("Preencha o nome do cliente e adicione pelo menos um item para gerar o PDF.");
        return;
      }

      const tempBudgetItems: BudgetItem[] = selectedItems.map(item => ({
        id: `temp-${item.id}`, // Placeholder ID
        budget_id: 'temp-budget', // Placeholder ID
        service_id: item.type === 'service' ? item.id : null,
        package_id: item.type === 'package' ? item.id : null,
        item_type: item.type,
        item_name: item.name,
        item_description: item.description,
        item_price: item.price,
        created_at: new Date().toISOString(),
      }));

      const fullClientName = `${formData.client_first_name || ''} ${formData.client_last_name || ''}`.trim();

      budgetToUse = {
        id: 'temp-budget-id', // Placeholder ID
        user_id: selectedClientId || user?.id || 'anonymous', // Use selected client ID or current user ID
        proposal_number: 'PREVIEW', // Placeholder for unsaved budget
        client_name: fullClientName, // Usa o nome completo construído
        client_phone: formData.client_phone || null,
        client_email: formData.client_email || null,
        client_street: formData.client_street || null,
        client_number: formData.client_number || null,
        client_complement: formData.client_complement || null,
        client_neighborhood: formData.client_neighborhood || null,
        client_city: formData.client_city || null,
        client_state: formData.client_state || null,
        client_cep: formData.client_cep || null,
        valid_until: calculateValidUntil(), // Use current calculation
        total_amount: totalAmount, // Use current calculated total
        created_at: new Date().toISOString(),
        status: 'pending', // Preview is always pending
        approved_at: null,
        budget_items: tempBudgetItems,
      };
    }

    if (!budgetToUse) {
      toast.error("Não foi possível preparar o orçamento para o PDF.");
      return;
    }

    // Now call generatePdfContent with budgetToUse, annualDiscountSetting, and whatsappContactNumber
    const htmlContent = await generatePdfContent(budgetToUse, annualDiscountSetting, whatsappContactNumber);

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px'; // A4 width approx
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Orcamento_${budgetToUse.client_name.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;

      if (action === 'download') {
        pdf.save(filename);
        toast.success('PDF gerado e baixado com sucesso!');
      } else { // action === 'view'
        window.open(pdf.output('bloburl'), '_blank');
        toast.success('PDF aberto em nova aba!');
      }
    } catch (error) {
      console.error(`Erro ao ${action === 'download' ? 'gerar' : 'visualizar'} PDF:`, error);
      toast.error(`Falha ao ${action === 'download' ? 'gerar' : 'visualizar'} PDF. Tente novamente.`);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  // Function to close dialog and reset state
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      client_first_name: '',
      client_last_name: '',
      client_phone: '',
      client_email: '',
      client_street: '',
      client_number: '',
      client_complement: '',
      client_neighborhood: '',
      client_city: '',
      client_state: '',
      client_cep: '',
    });
    setSelectedItems([]);
    setSelectedClientId(null); // Reset selected client
    setCurrentEditableBudget(null);
  };

  // NOVO: Mutação para aprovar orçamento e criar projeto
  const approveBudgetMutation = useMutation<void, Error, string>({
    mutationFn: async (budgetId) => {
      // 1. Buscar o orçamento completo
      const { data: budgetToApproveData, error: fetchError } = await supabase
        .from('budgets')
        .select('*, budget_items(*)')
        .eq('id', budgetId)
        .single();

      if (fetchError) throw fetchError;
      if (!budgetToApproveData) throw new Error("Orçamento não encontrado.");

      // 2. Atualizar o status do orçamento para 'converted' e registrar a data de aprovação
      const approvedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ status: 'converted', approved_at: approvedAt })
        .eq('id', budgetId);
      if (updateError) throw updateError;

      // 3. Criar um registro em 'client_contracts'
      if (budgetToApproveData.budget_items.length > 0) {
        const firstItem = budgetToApproveData.budget_items[0];
        const contractType = firstItem.item_type === 'package' ? 'monthly' : 'one-time';
        
        // Calcular totalDeliveryDays para o estimatedCompletionDate
        let totalDeliveryDays = 0;
        if (contractType === 'one-time' && firstItem.service_id) {
          const service = services?.find(s => s.id === firstItem.service_id);
          totalDeliveryDays += service?.initial_delivery_days || 0;
        } else if (contractType === 'monthly' && firstItem.package_id) {
          const pkg = allPackages?.find(p => p.id === firstItem.package_id);
          pkg?.services_in_package?.forEach(s => {
            totalDeliveryDays += s.initial_delivery_days || 0;
          });
        }
        const estimatedCompletionDate = addBusinessDays(new Date(approvedAt), totalDeliveryDays);

        const { error: contractError } = await supabase
          .from('client_contracts')
          .insert({
            client_id: budgetToApproveData.user_id,
            budget_id: budgetToApproveData.id,
            contract_type: contractType,
            start_date: approvedAt,
            end_date: format(estimatedCompletionDate, 'yyyy-MM-dd'), // Usar a data calculada
            price_agreed: budgetToApproveData.total_amount,
            is_paid: true, // Padrão para pago
            payment_due_date: null, // Padrão para null
            service_id: firstItem.item_type === 'service' ? firstItem.service_id : null,
            package_id: firstItem.item_type === 'package' ? firstItem.package_id : null,
          });
        if (contractError) throw contractError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] }); // Invalidar a query de projetos do cliente
      toast.success('Orçamento aprovado e projeto criado com sucesso!');
      setIsApproveConfirmOpen(false); // Fechar o pop-up de confirmação
      setBudgetToApprove(null); // Limpar o orçamento em aprovação
    },
    onError: (err) => {
      toast.error(`Erro ao aprovar orçamento ou criar projeto: ${err.message}`);
    },
  });

  // NOVO: Mutação para reverter aprovação de orçamento e deletar projeto
  const revertBudgetMutation = useMutation<void, Error, string>({
    mutationFn: async (budgetId) => {
      // 1. Deletar o registro correspondente em 'client_contracts'
      const { error: deleteContractError } = await supabase
        .from('client_contracts')
        .delete()
        .eq('budget_id', budgetId);
      if (deleteContractError) throw deleteContractError;

      // 2. Atualizar o status do orçamento para 'pending' e remover a data de aprovação
      const { error: updateBudgetError } = await supabase
        .from('budgets')
        .update({ status: 'pending', approved_at: null })
        .eq('id', budgetId);
      if (updateBudgetError) throw updateBudgetError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] }); // Invalidar a query de projetos do cliente
      toast.success('Aprovação de orçamento revertida e projeto removido com sucesso!');
      setIsRevertConfirmOpen(false); // Fechar o pop-up de confirmação de reversão
      setBudgetToRevert(null); // Limpar o orçamento em reversão
    },
    onError: (err) => {
      toast.error(`Erro ao reverter aprovação: ${err.message}`);
    },
  });

  // NOVO: Mutação para deletar orçamento
  const deleteBudgetMutation = useMutation<void, Error, string>({
    mutationFn: async (budgetId) => {
      // Primeiro, verificar se há um contrato vinculado e deletá-lo
      const { data: existingContract, error: fetchContractError } = await supabase
        .from('client_contracts')
        .select('id')
        .eq('budget_id', budgetId)
        .single();

      if (fetchContractError && fetchContractError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchContractError;
      }

      if (existingContract) {
        const { error: deleteContractError } = await supabase
          .from('client_contracts')
          .delete()
          .eq('budget_id', budgetId);
        if (deleteContractError) throw deleteContractError;
      }

      // Em seguida, deletar os itens do orçamento
      const { error: deleteItemsError } = await supabase
        .from('budget_items')
        .delete()
        .eq('budget_id', budgetId);
      if (deleteItemsError) throw deleteItemsError;

      // Finalmente, deletar o orçamento
      const { error: deleteBudgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);
      if (deleteBudgetError) throw deleteBudgetError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] }); // Invalidar a query de projetos do cliente
      toast.success('Orçamento excluído com sucesso!');
      setIsDeleteConfirmOpen(false); // Fechar o pop-up de confirmação de exclusão
      setBudgetToDelete(null); // Limpar o orçamento a ser excluído
    },
    onError: (err) => {
      toast.error(`Erro ao excluir orçamento: ${err.message}`);
    },
  });

  const isSaveDisabled = saveBudgetMutation.isPending || !formData.client_first_name || selectedItems.length === 0 || (!formData.client_email && !selectedClientId);
  const isPdfActionDisabled = !formData.client_first_name || selectedItems.length === 0 || (!formData.client_email && !selectedClientId); // Updated condition

  if (isLoadingBudgets || isLoadingServices || isLoadingPackages || isLoadingCashDiscount || isLoadingRates || isLoadingAnnualDiscount || isLoadingWhatsappNumber || isLoadingClientProfilesData || isLoadingClientEmails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando orçamentos e configurações financeiras...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-[#57e389]">Gerenciar Orçamentos</h1>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Crie, duplique e gere propostas comerciais para seus clientes.
        </p>

        {/* Tabela de Orçamentos */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">Nº PROPOSTA</TableHead>
                <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                <TableHead className="text-muted-foreground">DATA CRIAÇÃO</TableHead>
                <TableHead className="text-muted-foreground">VALIDADE</TableHead>
                <TableHead className="text-muted-foreground">ITENS</TableHead>
                <TableHead className="text-muted-foreground">VALOR TOTAL</TableHead>
                <TableHead className="text-muted-foreground">STATUS</TableHead> {/* NOVA COLUNA */}
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets && budgets.length > 0 ? (
                budgets.map((budget) => (
                  <TableRow key={budget.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground py-4">{budget.proposal_number}</TableCell>
                    <TableCell className="font-medium text-foreground py-4">
                      {budget.client_name}
                      {budget.client_email && <p className="text-sm text-muted-foreground">{budget.client_email}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {format(new Date(budget.valid_until), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-4">
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {budget.budget_items.slice(0, 2).map(item => (
                          <li key={item.id}>{item.item_name}</li>
                        ))}
                        {budget.budget_items.length > 2 && (
                          <li>+{budget.budget_items.length - 2} mais</li>
                        )}
                      </ul>
                    </TableCell>
                    <TableCell className="font-bold text-foreground py-4">
                      R$ {budget.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-4"> {/* NOVA CÉLULA DE STATUS */}
                      <Badge className={getBudgetStatusBadgeVariant(budget.status)}>
                        {budget.status === 'pending' ? 'Pendente' :
                         budget.status === 'approved' ? 'Aprovado' :
                         budget.status === 'rejected' ? 'Rejeitado' :
                         budget.status === 'converted' ? 'Convertido' : 'Desconhecido'}
                      </Badge>
                      {budget.approved_at && budget.status === 'converted' && ( // Exibir data de aprovação apenas se convertido
                        <p className="text-xs text-muted-foreground mt-1">
                          em {format(new Date(budget.approved_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      {profile?.role === 'master' && budget.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setBudgetToApprove(budget); setIsApproveConfirmOpen(true); }} className="text-green-500 hover:text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                        </Button>
                      )}
                      {profile?.role === 'master' && budget.status === 'converted' && ( // NOVO: Botão Rever
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setBudgetToRevert(budget); setIsRevertConfirmOpen(true); }} className="text-red-500 hover:text-red-600">
                          <RotateCcw className="h-4 w-4 mr-2" /> Rever
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(budget)} className="text-primary hover:text-primary/80">
                        <Copy className="h-4 w-4 mr-2" /> Duplicar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePdfAction(budget, 'download')} className="text-green-500 hover:text-green-600">
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePdfAction(budget, 'view')} className="text-blue-500 hover:text-blue-600">
                        <Eye className="h-4 w-4 mr-2" /> Visualizar PDF
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setBudgetToDelete(budget); setIsDeleteConfirmOpen(true); }} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum orçamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Novo/Duplicar Orçamento */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {currentEditableBudget ? `Editar Orçamento #${currentEditableBudget.proposal_number}` : 'Novo Orçamento'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do cliente e adicione os serviços/pacotes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              {/* Dados do Cliente */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-primary mb-4">Dados do Cliente</h3>
                
                {/* Seletor de Cliente Existente */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="select-client">Selecionar Cliente Existente</Label>
                  <Select
                    value={selectedClientId || 'new'}
                    onValueChange={handleClientSelect}
                  >
                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecionar um cliente..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="new">
                        <div className="flex items-center gap-2 text-primary">
                          <PlusCircle className="w-4 h-4" /> Novo Cliente (Preencher Manualmente)
                        </div>
                      </SelectItem>
                      {clientProfiles?.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {client.first_name} {client.last_name} ({client.client_id || 'N/A'}) - {client.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClientId && (
                    <Button variant="outline" size="sm" onClick={() => handleClientSelect('new')} className="mt-2 bg-background border-border text-foreground hover:bg-muted">
                      <X className="mr-2 h-4 w-4" /> Limpar Seleção
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_first_name">Nome *</Label>
                    <Input
                      id="client_first_name"
                      name="client_first_name"
                      value={formData.client_first_name || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                      required
                      disabled={!!selectedClientId} // Desabilita se um cliente for selecionado
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_last_name">Sobrenome</Label>
                    <Input
                      id="client_last_name"
                      name="client_last_name"
                      value={formData.client_last_name || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                      disabled={!!selectedClientId} // Desabilita se um cliente for selecionado
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Telefone do Cliente</Label>
                    <Input
                      id="client_phone"
                      name="client_phone"
                      type="tel"
                      value={formData.client_phone || ''}
                      onChange={handleFormChange}
                      placeholder="(00) 00000-0000"
                      className="bg-background border-border text-foreground"
                      disabled={!!selectedClientId} // Desabilita se um cliente for selecionado
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_email">E-mail do Cliente</Label>
                    <Input
                      id="client_email"
                      name="client_email"
                      type="email"
                      value={formData.client_email || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                      required={!selectedClientId} // Obrigatório apenas se for um novo cliente
                      disabled={!!selectedClientId} // Desabilita se um cliente for selecionado
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_street">Endereço</Label>
                    <Input
                      id="client_street"
                      name="client_street"
                      value={formData.client_street || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_number">Número</Label>
                    <Input
                      id="client_number"
                      name="client_number"
                      value={formData.client_number || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_complement">Complemento</Label>
                    <Input
                      id="client_complement"
                      name="client_complement"
                      value={formData.client_complement || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_neighborhood">Bairro</Label>
                    <Input
                      id="client_neighborhood"
                      name="client_neighborhood"
                      value={formData.client_neighborhood || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_city">Cidade</Label>
                    <Input
                      id="client_city"
                      name="client_city"
                      value={formData.client_city || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_state">Estado</Label>
                    <Input
                      id="client_state"
                      name="client_state"
                      value={formData.client_state || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_cep">CEP</Label>
                    <Input
                      id="client_cep"
                      name="client_cep"
                      value={formData.client_cep || ''}
                      onChange={handleFormChange}
                      maxLength={9} // 00000-000
                      placeholder="00000-000"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Adicionar Serviços/Pacotes - AGORA COM LISTA DE SELEÇÃO */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Adicionar Serviços/Pacotes</h3>
                
                {/* Campo de busca para filtrar a lista de seleção */}
                <div className="relative mb-4">
                  <Input
                    placeholder={`Filtrar ${currentSelectionType === 'service' ? 'serviços' : currentSelectionType === 'package' ? 'pacotes' : 'serviços ou pacotes'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Lista de Itens Disponíveis com Checkboxes */}
                <ScrollArea className="h-60 w-full rounded-md border border-border p-4 bg-background mb-4">
                  {filteredAvailableItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredAvailableItems.map(item => (
                        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`${item.type}-${item.id}`}
                              checked={selectedItems.some(selected => selected.id === item.id && selected.type === item.type)}
                              onChange={() => handleToggleItem(item)}
                              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                            />
                            <Label htmlFor={`${item.type}-${item.id}`} className="text-foreground cursor-pointer flex-1">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name} <span className="text-muted-foreground text-sm">({item.sku})</span></span>
                                {item.description && <span className="text-muted-foreground text-xs line-clamp-1">{item.description || (item.type === 'package' ? 'Pacote de serviços' : 'Serviço individual')}</span>}
                              </div>
                            </Label>
                          </div>
                          <span className="text-primary font-semibold">R$ {item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum {currentSelectionType === 'service' ? 'serviço' : currentSelectionType === 'package' ? 'pacote' : 'serviço ou pacote'} encontrado.
                    </p>
                  )}
                </ScrollArea>

                {/* Itens Selecionados (mantido como está, mas agora reflete a seleção por checkbox) */}
                <h4 className="text-lg font-semibold text-foreground mb-3">Itens Selecionados ({selectedItems.length})</h4>
                <ScrollArea className="h-40 w-full rounded-md border border-border p-4 bg-background mb-4">
                  {selectedItems.length > 0 ? (
                    <div className="space-y-3">
                      {selectedItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/10">
                          <div>
                            <p className="font-medium text-foreground">{item.name} <span className="text-muted-foreground text-sm">({item.type === 'service' ? 'Serviço' : 'Pacote'})</span></p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">R$ {item.price.toFixed(2)}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)} className="text-destructive hover:text-destructive/80">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
                  )}
                </ScrollArea>
                <div className="flex justify-between items-center text-lg font-bold text-foreground mt-4">
                  <span>Valor Total do Orçamento:</span>
                  <span className="text-primary">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Resumo de Valores Adicionais */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Opções de Pagamento</h3>
                {currentSelectionType === 'package' ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor Mensal</Label>
                      <Input value={`R$ ${packageMonthlyPrice.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor Anual ({packageAnnualDiscountPercentage}% OFF)</Label>
                      <Input value={`R$ ${packageAnnualPriceWithDiscount.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor Mensal (Pacote Anual)</Label>
                      <Input value={`R$ ${packageMonthlyPriceFromAnnual.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor à Vista ({cashDiscountPercentage}% de desconto)</Label>
                      <Input value={`R$ ${valorAVistaComDesconto.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor Parcelado em até 6x</Label>
                      <Input value={`6x de R$ ${parcelamento6x.parcela.toFixed(2)} (Total: R$ ${parcelamento6x.total.toFixed(2)})`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor Parcelado em até 10x</Label>
                      <Input value={`10x de R$ ${parcelamento10x.parcela.toFixed(2)} (Total: R$ ${parcelamento10x.total.toFixed(2)})`} readOnly className="bg-muted/50 border-border text-foreground font-semibold" />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="md:col-span-2 mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaveDisabled} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {saveBudgetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePdfAction(null, 'download')}
                  disabled={isPdfActionDisabled}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" /> Gerar PDF
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePdfAction(null, 'view')}
                  disabled={isPdfActionDisabled}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" /> Visualizar PDF
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pop-up de Confirmação de Aprovação */}
        <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Confirmar Aprovação</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tem certeza que deseja aprovar o orçamento <span className="font-semibold text-white">#{budgetToApprove?.proposal_number}</span>?
                Esta ação irá criar um novo projeto e não poderá ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsApproveConfirmOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={() => budgetToApprove && approveBudgetMutation.mutate(budgetToApprove.id)} disabled={approveBudgetMutation.isPending} className="bg-green-500 hover:bg-green-600 text-white">
                {approveBudgetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Aprovar e Criar Projeto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Pop-up de Confirmação de Reversão */}
        <Dialog open={isRevertConfirmOpen} onOpenChange={setIsRevertConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive">Confirmar Reversão</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tem certeza que deseja <span className="font-semibold text-destructive">reverter a aprovação</span> do orçamento <span className="font-semibold text-white">#{budgetToRevert?.proposal_number}</span>?
                Esta ação irá remover o projeto correspondente e não poderá ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRevertConfirmOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={() => budgetToRevert && revertBudgetMutation.mutate(budgetToRevert.id)} disabled={revertBudgetMutation.isPending} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {revertBudgetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Reverter Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Pop-up de Confirmação de Exclusão */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive">Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tem certeza que deseja <span className="font-semibold text-destructive">excluir</span> o orçamento <span className="font-semibold text-white">#{budgetToDelete?.proposal_number}</span>?
                Esta ação é irreversível e também removerá qualquer projeto vinculado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={() => budgetToDelete && deleteBudgetMutation.mutate(budgetToDelete.id)} disabled={deleteBudgetMutation.isPending} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {deleteBudgetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Excluir Orçamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden div for PDF generation - do not remove */}
        <div ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}></div>
      </motion.div>
    </DashboardLayout>
  );
}