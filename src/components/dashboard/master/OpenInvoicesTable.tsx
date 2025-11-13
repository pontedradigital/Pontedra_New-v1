import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: string;
  customer: string;
  ship: string;
  bestPrice: string;
  purchasedPrice: string;
  status: 'Em Progresso' | 'Aberto' | 'Recusado';
}

const invoices: Invoice[] = [
  { id: '50014', customer: 'David Grey', ship: 'Itália', bestPrice: '$6300', purchasedPrice: '$2100', status: 'Em Progresso' },
  { id: '50015', customer: 'Stella Johnson', ship: 'Brasil', bestPrice: '$4500', purchasedPrice: '$4300', status: 'Aberto' },
  { id: '50016', customer: 'Marina Michel', ship: 'Japão', bestPrice: '$4300', purchasedPrice: '$6441', status: 'Recusado' },
  { id: '50017', customer: 'John Doe', ship: 'Índia', bestPrice: '$6400', purchasedPrice: '$2200', status: 'Em Progresso' },
  { id: '50018', customer: 'Stella Johnson', ship: 'Brasil', bestPrice: '$4500', purchasedPrice: '$4300', status: 'Aberto' },
  { id: '50019', customer: 'David Grey', ship: 'Itália', bestPrice: '$6300', purchasedPrice: '$2100', status: 'Em Progresso' },
];

const getStatusBadgeVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'Em Progresso': return 'bg-green-500 hover:bg-green-600 text-white';
    case 'Aberto': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'Recusado': return 'bg-red-500 hover:bg-red-600 text-white';
    default: return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export default function OpenInvoicesTable() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Faturas Abertas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, quibusdam eum, totam ut minus dolor eaque alias ratione repellat voluptate, libero beatae nobis facere quod. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque harum maxime quaerat quasi quam totam et.
        </p>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground">FATURA</TableHead>
              <TableHead className="text-muted-foreground">CLIENTE</TableHead>
              <TableHead className="text-muted-foreground">ENVIO</TableHead>
              <TableHead className="text-muted-foreground">MELHOR PREÇO</TableHead>
              <TableHead className="text-muted-foreground">PREÇO COMPRADO</TableHead>
              <TableHead className="text-muted-foreground">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="border-b border-border last:border-b-0">
                <TableCell className="font-medium text-foreground">{invoice.id}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.customer}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.ship}</TableCell>
                <TableCell className="text-foreground">{invoice.bestPrice}</TableCell>
                <TableCell className="text-foreground">{invoice.purchasedPrice}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}