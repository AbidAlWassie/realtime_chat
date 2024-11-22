export type SearchParams = { [key: string]: string | string[] | undefined };

export interface PageProps {
  params: Promise<{ receiverId: string }>;
  searchParams: Promise<SearchParams>;
}

