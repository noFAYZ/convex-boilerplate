"use client";

import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  createdAt: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[] | undefined;
  loading?: boolean;
}

export function TransactionsTable({ transactions, loading = false }: TransactionsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
            <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-3 px-4">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-foreground">{transaction.productName}</td>
              <td className="py-3 px-4 text-right font-medium">
                {(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge
                  variant={
                    transaction.status === "completed"
                      ? "default"
                      : transaction.status === "pending"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {transaction.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                {transaction.invoiceUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a href={transaction.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
