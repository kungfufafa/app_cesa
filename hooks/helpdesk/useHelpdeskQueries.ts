import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addHelpdeskComment,
  ChangeHelpdeskStatusInput,
  createHelpdeskTicket,
  CreateHelpdeskCommentInput,
  CreateHelpdeskTicketInput,
  deleteHelpdeskTicket,
  getHelpdeskMeta,
  getHelpdeskTicket,
  getHelpdeskTickets,
  HelpdeskListParams,
  HelpdeskTicketDetail,
  updateHelpdeskTicket,
  UpdateHelpdeskTicketInput,
} from "@/services/helpdesk";
import { helpdeskKeys } from "./keys";

const DEFAULT_PER_PAGE = 20;

const getPageParamFromNextLink = (nextLink?: string | null) => {
  if (!nextLink) return undefined;

  try {
    const parsedUrl = new URL(nextLink, "http://localhost");
    const pageParam = parsedUrl.searchParams.get("page");
    if (!pageParam) return undefined;

    const page = Number(pageParam);
    return Number.isInteger(page) && page > 0 ? page : undefined;
  } catch {
    return undefined;
  }
};

const syncHelpdeskTicket = (
  queryClient: ReturnType<typeof useQueryClient>,
  ticket: HelpdeskTicketDetail
) => {
  queryClient.setQueryData(helpdeskKeys.detail(ticket.id), ticket);
  queryClient.invalidateQueries({ queryKey: helpdeskKeys.lists() });
};

export function useHelpdeskMeta(unitId?: number) {
  return useQuery({
    queryKey: helpdeskKeys.meta(unitId),
    queryFn: () => getHelpdeskMeta(unitId),
  });
}

export function useHelpdeskTicketList(params: Omit<HelpdeskListParams, "page"> = {}) {
  const normalizedParams = {
    ...params,
    per_page: params.per_page ?? DEFAULT_PER_PAGE,
  };

  return useInfiniteQuery({
    queryKey: helpdeskKeys.list(normalizedParams),
    queryFn: ({ pageParam }) =>
      getHelpdeskTickets({
        ...normalizedParams,
        page: typeof pageParam === "number" ? pageParam : 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPageFromLink = getPageParamFromNextLink(lastPage.links.next);

      if (nextPageFromLink) {
        return nextPageFromLink;
      }

      const nextPage = lastPage.meta.current_page + 1;
      return nextPage <= lastPage.meta.last_page ? nextPage : undefined;
    },
  });
}

export function useHelpdeskTicket(ticketId?: number | string) {
  return useQuery({
    queryKey: helpdeskKeys.detail(ticketId ?? "unknown"),
    queryFn: () => getHelpdeskTicket(ticketId!),
    enabled: !!ticketId,
  });
}

export function useCreateHelpdeskTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHelpdeskTicketInput) => createHelpdeskTicket(input),
    onSuccess: (ticket) => {
      syncHelpdeskTicket(queryClient, ticket);
    },
  });
}

export function useUpdateHelpdeskTicket(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHelpdeskTicketInput) => updateHelpdeskTicket(ticketId, input),
    onSuccess: (ticket) => {
      syncHelpdeskTicket(queryClient, ticket);
    },
  });
}

export function useChangeHelpdeskTicketStatus(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeHelpdeskStatusInput) => updateHelpdeskTicket(ticketId, input),
    onSuccess: (ticket) => {
      syncHelpdeskTicket(queryClient, ticket);
    },
  });
}

export function useAddHelpdeskComment(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHelpdeskCommentInput) => addHelpdeskComment(ticketId, input),
    onSuccess: (ticket) => {
      syncHelpdeskTicket(queryClient, ticket);
    },
  });
}

export function useDeleteHelpdeskTicket(ticketId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteHelpdeskTicket(ticketId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: helpdeskKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.lists() });
    },
  });
}
