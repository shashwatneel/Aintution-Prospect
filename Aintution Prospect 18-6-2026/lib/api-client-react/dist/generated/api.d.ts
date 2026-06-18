import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsOverview, BulkProspectInput, Card, CardInput, CardUpdate, EmailStep, EmailStepInput, EmailStepUpdate, HealthStatus, MessageStatus, MessageStatusUpdate, MessageTemplate, MessageTemplateInput, MessageTemplateUpdate, ProspectInput, ProspectUpdate, ProspectWithStatuses } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCardsUrl: () => string;
/**
 * @summary List all cards for current user
 */
export declare const listCards: (options?: RequestInit) => Promise<Card[]>;
export declare const getListCardsQueryKey: () => readonly ["/api/cards"];
export declare const getListCardsQueryOptions: <TData = Awaited<ReturnType<typeof listCards>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCardsQueryResult = NonNullable<Awaited<ReturnType<typeof listCards>>>;
export type ListCardsQueryError = ErrorType<unknown>;
/**
 * @summary List all cards for current user
 */
export declare function useListCards<TData = Awaited<ReturnType<typeof listCards>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCards>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCardUrl: () => string;
/**
 * @summary Create a new card
 */
export declare const createCard: (cardInput: CardInput, options?: RequestInit) => Promise<Card>;
export declare const getCreateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CardInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CardInput>;
}, TContext>;
export type CreateCardMutationResult = NonNullable<Awaited<ReturnType<typeof createCard>>>;
export type CreateCardMutationBody = BodyType<CardInput>;
export type CreateCardMutationError = ErrorType<unknown>;
/**
* @summary Create a new card
*/
export declare const useCreateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCard>>, TError, {
        data: BodyType<CardInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCard>>, TError, {
    data: BodyType<CardInput>;
}, TContext>;
export declare const getGetCardUrl: (cardId: number) => string;
/**
 * @summary Get a single card
 */
export declare const getCard: (cardId: number, options?: RequestInit) => Promise<Card>;
export declare const getGetCardQueryKey: (cardId: number) => readonly [`/api/cards/${number}`];
export declare const getGetCardQueryOptions: <TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<void>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCardQueryResult = NonNullable<Awaited<ReturnType<typeof getCard>>>;
export type GetCardQueryError = ErrorType<void>;
/**
 * @summary Get a single card
 */
export declare function useGetCard<TData = Awaited<ReturnType<typeof getCard>>, TError = ErrorType<void>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCardUrl: (cardId: number) => string;
/**
 * @summary Update a card
 */
export declare const updateCard: (cardId: number, cardUpdate: CardUpdate, options?: RequestInit) => Promise<Card>;
export declare const getUpdateCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        cardId: number;
        data: BodyType<CardUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
    cardId: number;
    data: BodyType<CardUpdate>;
}, TContext>;
export type UpdateCardMutationResult = NonNullable<Awaited<ReturnType<typeof updateCard>>>;
export type UpdateCardMutationBody = BodyType<CardUpdate>;
export type UpdateCardMutationError = ErrorType<unknown>;
/**
* @summary Update a card
*/
export declare const useUpdateCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCard>>, TError, {
        cardId: number;
        data: BodyType<CardUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCard>>, TError, {
    cardId: number;
    data: BodyType<CardUpdate>;
}, TContext>;
export declare const getDeleteCardUrl: (cardId: number) => string;
/**
 * @summary Delete a card
 */
export declare const deleteCard: (cardId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        cardId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
    cardId: number;
}, TContext>;
export type DeleteCardMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCard>>>;
export type DeleteCardMutationError = ErrorType<unknown>;
/**
* @summary Delete a card
*/
export declare const useDeleteCard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCard>>, TError, {
        cardId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCard>>, TError, {
    cardId: number;
}, TContext>;
export declare const getListMessagesUrl: (cardId: number) => string;
/**
 * @summary List message templates for a card
 */
export declare const listMessages: (cardId: number, options?: RequestInit) => Promise<MessageTemplate[]>;
export declare const getListMessagesQueryKey: (cardId: number) => readonly [`/api/cards/${number}/messages`];
export declare const getListMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listMessages>>>;
export type ListMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List message templates for a card
 */
export declare function useListMessages<TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMessageUrl: (cardId: number) => string;
/**
 * @summary Create a message template
 */
export declare const createMessage: (cardId: number, messageTemplateInput: MessageTemplateInput, options?: RequestInit) => Promise<MessageTemplate>;
export declare const getCreateMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMessage>>, TError, {
        cardId: number;
        data: BodyType<MessageTemplateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMessage>>, TError, {
    cardId: number;
    data: BodyType<MessageTemplateInput>;
}, TContext>;
export type CreateMessageMutationResult = NonNullable<Awaited<ReturnType<typeof createMessage>>>;
export type CreateMessageMutationBody = BodyType<MessageTemplateInput>;
export type CreateMessageMutationError = ErrorType<unknown>;
/**
* @summary Create a message template
*/
export declare const useCreateMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMessage>>, TError, {
        cardId: number;
        data: BodyType<MessageTemplateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMessage>>, TError, {
    cardId: number;
    data: BodyType<MessageTemplateInput>;
}, TContext>;
export declare const getUpdateMessageUrl: (cardId: number, messageId: number) => string;
/**
 * @summary Update a message template
 */
export declare const updateMessage: (cardId: number, messageId: number, messageTemplateUpdate: MessageTemplateUpdate, options?: RequestInit) => Promise<MessageTemplate>;
export declare const getUpdateMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMessage>>, TError, {
        cardId: number;
        messageId: number;
        data: BodyType<MessageTemplateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMessage>>, TError, {
    cardId: number;
    messageId: number;
    data: BodyType<MessageTemplateUpdate>;
}, TContext>;
export type UpdateMessageMutationResult = NonNullable<Awaited<ReturnType<typeof updateMessage>>>;
export type UpdateMessageMutationBody = BodyType<MessageTemplateUpdate>;
export type UpdateMessageMutationError = ErrorType<unknown>;
/**
* @summary Update a message template
*/
export declare const useUpdateMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMessage>>, TError, {
        cardId: number;
        messageId: number;
        data: BodyType<MessageTemplateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMessage>>, TError, {
    cardId: number;
    messageId: number;
    data: BodyType<MessageTemplateUpdate>;
}, TContext>;
export declare const getDeleteMessageUrl: (cardId: number, messageId: number) => string;
/**
 * @summary Delete a message template
 */
export declare const deleteMessage: (cardId: number, messageId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMessage>>, TError, {
        cardId: number;
        messageId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMessage>>, TError, {
    cardId: number;
    messageId: number;
}, TContext>;
export type DeleteMessageMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMessage>>>;
export type DeleteMessageMutationError = ErrorType<unknown>;
/**
* @summary Delete a message template
*/
export declare const useDeleteMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMessage>>, TError, {
        cardId: number;
        messageId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMessage>>, TError, {
    cardId: number;
    messageId: number;
}, TContext>;
export declare const getListProspectsUrl: (cardId: number) => string;
/**
 * @summary List prospects for a card
 */
export declare const listProspects: (cardId: number, options?: RequestInit) => Promise<ProspectWithStatuses[]>;
export declare const getListProspectsQueryKey: (cardId: number) => readonly [`/api/cards/${number}/prospects`];
export declare const getListProspectsQueryOptions: <TData = Awaited<ReturnType<typeof listProspects>>, TError = ErrorType<unknown>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProspects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProspects>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProspectsQueryResult = NonNullable<Awaited<ReturnType<typeof listProspects>>>;
export type ListProspectsQueryError = ErrorType<unknown>;
/**
 * @summary List prospects for a card
 */
export declare function useListProspects<TData = Awaited<ReturnType<typeof listProspects>>, TError = ErrorType<unknown>>(cardId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProspects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProspectUrl: (cardId: number) => string;
/**
 * @summary Create a prospect
 */
export declare const createProspect: (cardId: number, prospectInput: ProspectInput, options?: RequestInit) => Promise<ProspectWithStatuses>;
export declare const getCreateProspectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProspect>>, TError, {
        cardId: number;
        data: BodyType<ProspectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProspect>>, TError, {
    cardId: number;
    data: BodyType<ProspectInput>;
}, TContext>;
export type CreateProspectMutationResult = NonNullable<Awaited<ReturnType<typeof createProspect>>>;
export type CreateProspectMutationBody = BodyType<ProspectInput>;
export type CreateProspectMutationError = ErrorType<unknown>;
/**
* @summary Create a prospect
*/
export declare const useCreateProspect: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProspect>>, TError, {
        cardId: number;
        data: BodyType<ProspectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProspect>>, TError, {
    cardId: number;
    data: BodyType<ProspectInput>;
}, TContext>;
export declare const getBulkCreateProspectsUrl: (cardId: number) => string;
/**
 * @summary Bulk create prospects (paste from spreadsheet)
 */
export declare const bulkCreateProspects: (cardId: number, bulkProspectInput: BulkProspectInput, options?: RequestInit) => Promise<ProspectWithStatuses[]>;
export declare const getBulkCreateProspectsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bulkCreateProspects>>, TError, {
        cardId: number;
        data: BodyType<BulkProspectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof bulkCreateProspects>>, TError, {
    cardId: number;
    data: BodyType<BulkProspectInput>;
}, TContext>;
export type BulkCreateProspectsMutationResult = NonNullable<Awaited<ReturnType<typeof bulkCreateProspects>>>;
export type BulkCreateProspectsMutationBody = BodyType<BulkProspectInput>;
export type BulkCreateProspectsMutationError = ErrorType<unknown>;
/**
* @summary Bulk create prospects (paste from spreadsheet)
*/
export declare const useBulkCreateProspects: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bulkCreateProspects>>, TError, {
        cardId: number;
        data: BodyType<BulkProspectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof bulkCreateProspects>>, TError, {
    cardId: number;
    data: BodyType<BulkProspectInput>;
}, TContext>;
export declare const getUpdateProspectUrl: (cardId: number, prospectId: number) => string;
/**
 * @summary Update a prospect
 */
export declare const updateProspect: (cardId: number, prospectId: number, prospectUpdate: ProspectUpdate, options?: RequestInit) => Promise<ProspectWithStatuses>;
export declare const getUpdateProspectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProspect>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<ProspectUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProspect>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<ProspectUpdate>;
}, TContext>;
export type UpdateProspectMutationResult = NonNullable<Awaited<ReturnType<typeof updateProspect>>>;
export type UpdateProspectMutationBody = BodyType<ProspectUpdate>;
export type UpdateProspectMutationError = ErrorType<unknown>;
/**
* @summary Update a prospect
*/
export declare const useUpdateProspect: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProspect>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<ProspectUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProspect>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<ProspectUpdate>;
}, TContext>;
export declare const getDeleteProspectUrl: (cardId: number, prospectId: number) => string;
/**
 * @summary Delete a prospect
 */
export declare const deleteProspect: (cardId: number, prospectId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProspectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProspect>>, TError, {
        cardId: number;
        prospectId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProspect>>, TError, {
    cardId: number;
    prospectId: number;
}, TContext>;
export type DeleteProspectMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProspect>>>;
export type DeleteProspectMutationError = ErrorType<unknown>;
/**
* @summary Delete a prospect
*/
export declare const useDeleteProspect: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProspect>>, TError, {
        cardId: number;
        prospectId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProspect>>, TError, {
    cardId: number;
    prospectId: number;
}, TContext>;
export declare const getUpdateMessageStatusUrl: (cardId: number, prospectId: number) => string;
/**
 * @summary Toggle done status for a message on a prospect
 */
export declare const updateMessageStatus: (cardId: number, prospectId: number, messageStatusUpdate: MessageStatusUpdate, options?: RequestInit) => Promise<MessageStatus>;
export declare const getUpdateMessageStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMessageStatus>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<MessageStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMessageStatus>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<MessageStatusUpdate>;
}, TContext>;
export type UpdateMessageStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateMessageStatus>>>;
export type UpdateMessageStatusMutationBody = BodyType<MessageStatusUpdate>;
export type UpdateMessageStatusMutationError = ErrorType<unknown>;
/**
* @summary Toggle done status for a message on a prospect
*/
export declare const useUpdateMessageStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMessageStatus>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<MessageStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMessageStatus>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<MessageStatusUpdate>;
}, TContext>;
export declare const getCreateEmailStepUrl: (cardId: number, prospectId: number) => string;
/**
 * @summary Add an email step to a prospect
 */
export declare const createEmailStep: (cardId: number, prospectId: number, emailStepInput: EmailStepInput, options?: RequestInit) => Promise<EmailStep>;
export declare const getCreateEmailStepMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<EmailStepInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<EmailStepInput>;
}, TContext>;
export type CreateEmailStepMutationResult = NonNullable<Awaited<ReturnType<typeof createEmailStep>>>;
export type CreateEmailStepMutationBody = BodyType<EmailStepInput>;
export type CreateEmailStepMutationError = ErrorType<unknown>;
/**
* @summary Add an email step to a prospect
*/
export declare const useCreateEmailStep: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        data: BodyType<EmailStepInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    data: BodyType<EmailStepInput>;
}, TContext>;
export declare const getUpdateEmailStepUrl: (cardId: number, prospectId: number, stepId: number) => string;
/**
 * @summary Update an email step (toggle done or rename)
 */
export declare const updateEmailStep: (cardId: number, prospectId: number, stepId: number, emailStepUpdate: EmailStepUpdate, options?: RequestInit) => Promise<EmailStep>;
export declare const getUpdateEmailStepMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        stepId: number;
        data: BodyType<EmailStepUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    stepId: number;
    data: BodyType<EmailStepUpdate>;
}, TContext>;
export type UpdateEmailStepMutationResult = NonNullable<Awaited<ReturnType<typeof updateEmailStep>>>;
export type UpdateEmailStepMutationBody = BodyType<EmailStepUpdate>;
export type UpdateEmailStepMutationError = ErrorType<unknown>;
/**
* @summary Update an email step (toggle done or rename)
*/
export declare const useUpdateEmailStep: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        stepId: number;
        data: BodyType<EmailStepUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    stepId: number;
    data: BodyType<EmailStepUpdate>;
}, TContext>;
export declare const getDeleteEmailStepUrl: (cardId: number, prospectId: number, stepId: number) => string;
/**
 * @summary Delete an email step
 */
export declare const deleteEmailStep: (cardId: number, prospectId: number, stepId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEmailStepMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        stepId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    stepId: number;
}, TContext>;
export type DeleteEmailStepMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEmailStep>>>;
export type DeleteEmailStepMutationError = ErrorType<unknown>;
/**
* @summary Delete an email step
*/
export declare const useDeleteEmailStep: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmailStep>>, TError, {
        cardId: number;
        prospectId: number;
        stepId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEmailStep>>, TError, {
    cardId: number;
    prospectId: number;
    stepId: number;
}, TContext>;
export declare const getGetAnalyticsUrl: () => string;
/**
 * @summary Get analytics overview for all cards
 */
export declare const getAnalytics: (options?: RequestInit) => Promise<AnalyticsOverview>;
export declare const getGetAnalyticsQueryKey: () => readonly ["/api/analytics"];
export declare const getGetAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getAnalytics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalytics>>>;
export type GetAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Get analytics overview for all cards
 */
export declare function useGetAnalytics<TData = Awaited<ReturnType<typeof getAnalytics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getExportCsvUrl: () => string;
/**
 * @summary Export all prospects data as CSV
 */
export declare const exportCsv: (options?: RequestInit) => Promise<string>;
export declare const getExportCsvQueryKey: () => readonly ["/api/analytics/export-csv"];
export declare const getExportCsvQueryOptions: <TData = Awaited<ReturnType<typeof exportCsv>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportCsv>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof exportCsv>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ExportCsvQueryResult = NonNullable<Awaited<ReturnType<typeof exportCsv>>>;
export type ExportCsvQueryError = ErrorType<unknown>;
/**
 * @summary Export all prospects data as CSV
 */
export declare function useExportCsv<TData = Awaited<ReturnType<typeof exportCsv>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof exportCsv>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map