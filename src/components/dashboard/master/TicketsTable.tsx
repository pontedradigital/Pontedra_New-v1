import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ticket {
  id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  project: string;
  projectLink?: string;
}

const tickets: Ticket[] = [
  { id: '1', name: 'Alta Lucas', location: 'Connecticut', date: '31 Ago 2018', time: '9:30 am', project: '6770 Verner Burgs', projectLink: '#' },
  { id: '2', name: 'Teresa Shaw', location: 'Florida', date: '13 Mai 2018', time: '10:30 am', project: '1300 Gideon Divide Apt. 400', projectLink: '#' },
  { id: '3', name: 'Rosa Underwood', location: 'North Dakota', date: '02 Jan 2018', time: '11:00 am', project: '9576 Rempel Extension' },
  { id: '4', name: 'Wilson Rowe', location: 'Denver', date: '05 Nov 2018', time: '02:30 am', project: '1072 Orion Expansion' },
  { id: '5', name: 'Teresa Shaw', location: 'Florida', date: '13 Mai 2018', time: '10:30 am', project: '1300 Gideon Divide Apt. 400', projectLink: '#' },
];

const getAvatarColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function TicketsTable() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Tickets</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuItem>Ver Todos</DropdownMenuItem>
            <DropdownMenuItem>Atualizar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground">NOME</TableHead>
              <TableHead className="text-muted-foreground">DATA</TableHead>
              <TableHead className="text-muted-foreground">PROJETOS</TableHead>
              <TableHead className="text-muted-foreground text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-b border-border last:border-b-0">
                <TableCell className="flex items-center py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${getAvatarColor(ticket.name)}`}>
                    {ticket.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{ticket.name}</p>
                    <p className="text-xs text-muted-foreground">{ticket.location}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{ticket.date}</p>
                  <p className="text-xs text-muted-foreground">{ticket.time}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{ticket.project}</p>
                  {ticket.projectLink && (
                    <a href={ticket.projectLink} className="text-xs text-primary hover:underline">
                      Ver no mapa
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}