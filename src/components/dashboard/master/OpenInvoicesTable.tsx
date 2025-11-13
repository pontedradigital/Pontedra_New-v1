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
  status: 'Progress' | 'Open' | 'Declined';
}

const invoices: Invoice[] = [
  { id: '50014', customer: 'David Grey', ship: 'Italy', bestPrice: '$6300', purchasedPrice: '$2100', status: 'Progress' },
  { id: '50015', customer: 'Stella Johnson', ship: 'Brazil', bestPrice: '$4500', purchasedPrice: '$4300', status: 'Open' },
  { id: '50016', customer: 'Marina Michel', ship: 'Japan', bestPrice: '$4300', purchasedPrice: '$6441', status: 'Declined' },
  { id: '50017', customer: 'John Doe', ship: 'India', bestPrice: '$6400', purchasedPrice: '$2200', status: 'Progress' },
  { id: '50018', customer: 'Stella Johnson', ship: 'Brazil', bestPrice: '$4500', purchasedPrice: '$4300', status: 'Open' },
  { id: '50019', customer: 'David Grey', ship: 'Italy', bestPrice: '$6300', purchasedPrice: '$2100', status: 'Progress' },
];

const getStatusBadgeVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'Progress': return 'bg-green-500 hover:bg-green-600 text-white';
    case 'Open': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'Declined': return 'bg-red-500 hover:bg-red-600 text-white';
    default: return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export default function OpenInvoicesTable() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Open Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, quibusdam eum, totam ut minus dolor eaque alias ratione repellat voluptate, libero beatae nobis facere quod. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque harum maxime quaerat quasi quam totam et.
        </p>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground">INVOICE</TableHead>
              <TableHead className="text-muted-foreground">CUSTOMER</TableHead>
              <TableHead className="text-muted-foreground">SHIP</TableHead>
              <TableHead className="text-muted-foreground">BEST PRICE</TableHead>
              <TableHead className="text-muted-foreground">PURCHASED PRICE</TableHead>
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