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
import { PlusCircle, Copy, FileText, Loader2, CalendarDays, Mail, Phone, MapPin, DollarSign, Download, Eye, X } from 'lucide-react'; // Added Eye icon
import { format, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipos de dados para Serviços (products)
interface ServiceItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  final_price: number;
}

// Tipos de dados para Pacotes
interface PackageItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number; // Preço mensal final calculado
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
  budget_items: BudgetItem[];
}

interface InstallmentRate {
  installments: number;
  merchant_pays_rate: number;
  client_pays_rate: number;
}

export default function BudgetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Budget>>({
    client_name: '',
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

  // NEW STATE: To hold the budget that was just saved/created in the dialog
  const [currentEditableBudget, setCurrentEditableBudget] = useState<Budget | null>(null);

  // Fetch all services
  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceItem[], Error>({
    queryKey: ['allServices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('id, sku, name, description, final_price').order('name', { ascending: true });
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

  // --- NOVOS CÁLCULOS PARA OPÇÕES DE PAGAMENTO ---
  const cashDiscountPercentage = useMemo(() => defaultCashDiscountSetting?.value || 10, [defaultCashDiscountSetting]);

  const valorAVistaComDesconto = useMemo(() => {
    if (totalAmount === 0) return 0;
    return parseFloat((totalAmount * (1 - cashDiscountPercentage / 100)).toFixed(2));
  }, [totalAmount, cashDiscountPercentage]);

  const getInstallmentDetails = useCallback((installments: number) => {
    if (totalAmount === 0 || !installmentRates) return { total: 0, parcela: 0, taxa: 0 };

    const rate = installmentRates.find(r => r.installments === installments);
    const clientRate = rate ? rate.client_pays_rate : 0; // Usar a taxa que o cliente paga

    const totalComJuros = totalAmount * (1 + clientRate);
    const valorParcela = totalComJuros / installments;

    return {
      total: parseFloat(totalComJuros.toFixed(2)),
      parcela: parseFloat(valorParcela.toFixed(2)),
      taxa: parseFloat((clientRate * 100).toFixed(2)),
    };
  }, [totalAmount, installmentRates]);

  const parcelamento6x = useMemo(() => getInstallmentDetails(6), [getInstallmentDetails]);
  const parcelamento10x = useMemo(() => getInstallmentDetails(10), [getInstallmentDetails]);
  // --- FIM DOS NOVOS CÁLCULOS ---

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'client_cep') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCep(value),
      }));
    } else {
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
      setFormData({
        client_name: budgetToDuplicate.client_name,
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
      // When duplicating, set currentEditableBudget to the duplicated budget
      setCurrentEditableBudget(budgetToDuplicate); 
    } else {
      setFormData({
        client_name: '',
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
      setCurrentEditableBudget(null); // Clear for new budget
    }
    setIsDialogOpen(true);
  };

  // Renamed createBudgetMutation to saveBudgetMutation
  const saveBudgetMutation = useMutation<Budget, Error, { budgetData: Partial<Budget>; items: typeof selectedItems }>({
    mutationFn: async ({ budgetData, items }) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const validUntil = calculateValidUntil();
      const total = items.reduce((sum, item) => sum + item.price, 0);

      const { data: newBudgetResult, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          client_name: budgetData.client_name,
          client_phone: budgetData.client_phone,
          client_email: budgetData.client_email,
          client_street: budgetData.client_street,
          client_number: budgetData.client_number,
          client_complement: budgetData.client_complement,
          client_neighborhood: budgetData.client_neighborhood,
          client_city: budgetData.client_city,
          client_state: budgetData.client_state,
          client_cep: budgetData.client_cep,
          valid_until: validUntil,
          total_amount: total,
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
    onSuccess: (newlyCreatedBudget) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento salvo com sucesso!');
      setCurrentEditableBudget(newlyCreatedBudget); // Store the newly created budget
      // Do NOT close dialog or clear form here, allow user to generate PDF
    },
    onError: (err) => {
      toast.error(`Erro ao salvar orçamento: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || selectedItems.length === 0) {
      toast.error('Nome do cliente e pelo menos um item são obrigatórios.');
      return;
    }
    saveBudgetMutation.mutate({ budgetData: formData, items: selectedItems });
  };

  const generatePdfContent = async (budget: Budget) => {
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
    const pdfCashDiscountPercentage = defaultCashDiscountSetting?.value || 10;
    const pdfValorAVistaComDesconto = parseFloat((pdfTotalAmount * (1 - pdfCashDiscountPercentage / 100)).toFixed(2));

    const getPdfInstallmentDetails = (installments: number) => {
      if (pdfTotalAmount === 0 || !installmentRates) return { total: 0, parcela: 0, taxa: 0 };
      const rate = installmentRates.find(r => r.installments === installments);
      const clientRate = rate ? rate.client_pays_rate : 0;
      const totalComJuros = pdfTotalAmount * (1 + clientRate);
      const valorParcela = totalComJuros / installments;
      return {
        total: parseFloat(totalComJuros.toFixed(2)),
        parcela: parseFloat(valorParcela.toFixed(2)),
        taxa: parseFloat((clientRate * 100).toFixed(2)),
      };
    };

    const pdfParcelamento6x = getPdfInstallmentDetails(6);
    const pdfParcelamento10x = getPdfInstallmentDetails(10);

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
          <p style="font-size: 16px; text-align: right; margin-top: 20px;"><strong>Valor Total: R$ ${pdfTotalAmount.toFixed(2)}</strong></p>
          <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor à Vista (${pdfCashDiscountPercentage}% de desconto): R$ ${pdfValorAVistaComDesconto.toFixed(2)}</strong></p>
          <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Parcelado em até 6x: 6x de R$ ${pdfParcelamento6x.parcela.toFixed(2)} (Total: R$ ${pdfParcelamento6x.total.toFixed(2)})</strong></p>
          <p style="font-size: 16px; text-align: right; margin-top: 10px;"><strong>Valor Parcelado em até 10x: 10x de R$ ${pdfParcelamento10x.parcela.toFixed(2)} (Total: R$ ${pdfParcelamento10x.total.toFixed(2)})</strong></p>
        </div>

        <div style="text-align: center; margin-bottom: 30px; padding: 15px; background-color: #e0ffe0; border-radius: 8px;">
          <p style="font-size: 14px; color: #0D1B2A;"><strong>Validade da Proposta:</strong> ${format(new Date(budget.valid_until), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>

        <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin-bottom: 5px;"><strong>Pontedra</strong></p>
          <p style="margin-bottom: 5px;">E-mail: contato@pontedra.com</p>
          <p>Telefone: +55 11 97877-7308</p>
        </div>
      </div>
    `;
  };

  const handlePdfAction = async (budget: Budget, action: 'download' | 'view') => {
    if (!budget || !budget.id) {
      toast.error("Nenhum orçamento selecionado para gerar PDF.");
      return;
    }

    const htmlContent = await generatePdfContent(budget);

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

      const filename = `Orcamento_${budget.client_name.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;

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
    setFormData({});
    setSelectedItems([]);
    setCurrentEditableBudget(null);
  };

  const isSaveDisabled = saveBudgetMutation.isPending || !formData.client_name || selectedItems.length === 0;
  const isPdfActionDisabled = !currentEditableBudget || saveBudgetMutation.isPending;

  if (isLoadingBudgets || isLoadingServices || isLoadingPackages || isLoadingCashDiscount || isLoadingRates) {
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
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(budget)} className="text-primary hover:text-primary/80">
                        <Copy className="h-4 w-4 mr-2" /> Duplicar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePdfAction(budget, 'download')} className="text-green-500 hover:text-green-600">
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePdfAction(budget, 'view')} className="text-blue-500 hover:text-blue-600">
                        <Eye className="h-4 w-4 mr-2" /> Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nome do Cliente *</Label>
                    <Input
                      id="client_name"
                      name="client_name"
                      value={formData.client_name || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Telefone do Cliente</Label>
                    <Input
                      id="client_phone"
                      name="client_phone"
                      value={formData.client_phone || ''}
                      onChange={handleFormChange}
                      className="bg-background border-border text-foreground"
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
                  onClick={() => handlePdfAction(currentEditableBudget!, 'download')}
                  disabled={isPdfActionDisabled}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" /> Gerar PDF
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePdfAction(currentEditableBudget!, 'view')}
                  disabled={isPdfActionDisabled}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" /> Visualizar PDF
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Hidden div for PDF generation - do not remove */}
        <div ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}></div>
      </motion.div>
    </DashboardLayout>
  );
}