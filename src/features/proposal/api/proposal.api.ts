import type {
  SaveProposalRequest,
  SaveProposalResponse,
  GetGroupProposalsResponse,
  UploadCensusFileRequest,
  UploadCensusFileResponse,
  GetGroupRFCResponse,
} from '../types/api.types';

// ═══════════════════════════════════════════════════════════════
// API ADAPTER — Replace these implementations with your real APIs
// ═══════════════════════════════════════════════════════════════
//
// This file is the ONLY place that touches your backend.
// Every function signature is a contract. The rest of the app
// depends on these return types. Change the implementation
// inside each function, but keep the signatures stable.

export async function saveProposal(
  groupId: string,
  proposal: SaveProposalRequest
): Promise<SaveProposalResponse> {
  // TODO: Replace with your API call
  // Example: return await portalApi.post(`/groups/${groupId}/proposals`, proposal);
  console.log('[API Stub] saveProposal', groupId, proposal);
  return {
    proposalId: `prop_${Date.now()}`,
    savedAt: new Date().toISOString(),
    downloadUrl: '#',
  };
}

export async function getGroupProposals(
  groupId: string
): Promise<GetGroupProposalsResponse> {
  // TODO: Replace with your API call
  console.log('[API Stub] getGroupProposals', groupId);
  return { proposals: [] };
}

export async function uploadCensusFile(
  groupId: string,
  file: UploadCensusFileRequest
): Promise<UploadCensusFileResponse> {
  // TODO: Replace with your API call
  console.log('[API Stub] uploadCensusFile', groupId, file.originalFileName);
  return {
    fileId: `file_${Date.now()}`,
    storedAt: new Date().toISOString(),
    downloadUrl: '#',
  };
}

export async function deleteProposal(
  groupId: string,
  proposalId: string
): Promise<void> {
  // TODO: Replace with your API call
  console.log('[API Stub] deleteProposal', groupId, proposalId);
}

export async function getGroupRFC(
  groupId: string
): Promise<GetGroupRFCResponse | null> {
  // TODO: Replace with your API call
  console.log('[API Stub] getGroupRFC', groupId);
  return null;
}

export async function getCurrentBroker(): Promise<{
  name: string;
  email: string;
  phone: string;
}> {
  // TODO: Replace with your auth/user context
  return {
    name: 'Demo Broker',
    email: 'broker@example.com',
    phone: '(555) 123-4567',
  };
}
