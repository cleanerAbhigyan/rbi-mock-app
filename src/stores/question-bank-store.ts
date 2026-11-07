import { create } from 'zustand';
import { localQuestionRepository } from '../data/question-bank/local-question-repository';

/** In-memory read model. No attempts or personal history are persisted in Phase 0. */
export const useQuestionBankStore = create(() => ({
  verifiedPyqs: localQuestionRepository.listVerifiedPyqs(),
}));
