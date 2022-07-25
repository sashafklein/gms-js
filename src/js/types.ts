export interface Settings {
  to?: string;
  theme?: string;
  amountIsFixed?: boolean;
  noteIsFixed?: boolean;
  displayName?: string;
  service?: string;
}

export interface Invoice {
  lnInvoice?: string;
  btcInvoice?: string;
  secondsLeft?: number;
  invoiceId?: string;
  status?: string;
}

export interface InvoiceRequest {
  to: string;
  amount: number;
  note: string;
}

export interface State {
  stage?: string;
  invoice?: Invoice;
  tipInvoice?: Invoice;
  amount?: number;
  note?: string;
}

export interface SpotOptions {
  selector: string;
  innerHTML: string;
}

export declare var gms: any;
