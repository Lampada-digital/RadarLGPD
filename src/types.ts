/* =====================================================================
   RADAR - Enterprise GRC Platform
   Schema de Dados Completo
   =====================================================================
   
   Este arquivo define a estrutura completa de dados do sistema RADAR.
   Esta estrutura está preparada para ser migrada para um banco PostgreSQL.
   
   Atualmente, os dados são armazenados no localStorage (frontend-only).
   Para produção, esta estrutura deve ser migrada para PostgreSQL com:
   - Migrations
   - Foreign keys
   - Indexes
   - Constraints
   - Soft delete
   - Timestamps
   - Tenant isolation
   - Histórico de alterações
   - Auditoria
   ===================================================================== */

// ============================================================================
// ENTIDADES PRINCIPAIS
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  cnpj?: string;
  address?: string;
  contacts?: Contact[];
  departments?: Department[];
  units?: Unit[];
  branches?: Branch[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface Department {
  id: string;
  name: string;
  manager?: string;
  parentId?: string;
}

export interface Unit {
  id: string;
  name: string;
  location?: string;
}

export interface Branch {
  id: string;
  name: string;
  location?: string;
}

// ============================================================================
// USUÁRIOS E PERMISSÕES
// ============================================================================

export type UserRole = 'full' | 'limited' | 'guest';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  active: boolean;
  mfaEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  actions: string[];
}

// ============================================================================
// ATIVOS E PROCESSOS
// ============================================================================

export interface Asset {
  id: string;
  organizationId: string;
  name: string;
  type: 'hardware' | 'software' | 'data' | 'service' | 'facility';
  description?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  departmentId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Process {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  ownerId?: string;
  departmentId?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  assets?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  ownerId?: string;
  sla?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface DataAsset {
  id: string;
  organizationId: string;
  name: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  ownerId?: string;
  retentionPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FORNECEDORES
// ============================================================================

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  cnpj?: string;
  contact?: Contact;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  lastAssessment?: string;
  contract?: string;
  status: 'active' | 'inactive' | 'under_review';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// RISCOS E CONTROLES
// ============================================================================

export interface Risk {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: string;
  assetId?: string;
  processId?: string;
  cause?: string;
  consequence?: string;
  inherentProbability: number;
  inherentImpact: number;
  inherentRisk: number;
  controls?: string[];
  residualProbability: number;
  residualImpact: number;
  residualRisk: number;
  treatment: 'accept' | 'avoid' | 'mitigate' | 'transfer';
  ownerId?: string;
  deadline?: string;
  status: 'open' | 'in_progress' | 'mitigated' | 'accepted' | 'closed';
  evidences?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Control {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description?: string;
  objective?: string;
  ownerId?: string;
  implementation?: string;
  maturity: number;
  effectiveness: number;
  periodicity?: string;
  evidences?: string[];
  risks?: string[];
  frameworks?: string[];
  requirements?: string[];
  audits?: string[];
  actionPlans?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FRAMEWORKS E COMPLIANCE
// ============================================================================

export interface Framework {
  id: string;
  organizationId: string;
  name: string;
  version?: string;
  description?: string;
  domains?: Domain[];
  createdAt: string;
  updatedAt: string;
}

export interface Domain {
  id: string;
  frameworkId: string;
  name: string;
  description?: string;
  requirements?: Requirement[];
}

export interface Requirement {
  id: string;
  domainId: string;
  code: string;
  name: string;
  description?: string;
  controls?: string[];
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  evidences?: string[];
}

// ============================================================================
// EVIDÊNCIAS E DOCUMENTOS
// ============================================================================

export interface Evidence {
  id: string;
  organizationId: string;
  type: 'declaratory' | 'documentary' | 'operational' | 'technical' | 'effectiveness';
  title: string;
  description?: string;
  fileUrl?: string;
  controlId?: string;
  requirementId?: string;
  auditId?: string;
  ownerId?: string;
  date: string;
  validUntil?: string;
  status: 'valid' | 'expired' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  organizationId: string;
  title: string;
  type: 'policy' | 'procedure' | 'manual' | 'plan' | 'report';
  version: string;
  content?: string;
  fileUrl?: string;
  ownerId?: string;
  approvedBy?: string;
  approvedAt?: string;
  validUntil?: string;
  status: 'draft' | 'approved' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUDITORIA
// ============================================================================

export interface Audit {
  id: string;
  organizationId: string;
  type: 'internal' | 'external' | 'vendor';
  title: string;
  scope?: string;
  criteria?: string;
  auditors?: string[];
  startDate?: string;
  endDate?: string;
  findings?: Finding[];
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  auditId: string;
  type: 'conformity' | 'non_conformity' | 'observation' | 'recommendation';
  description: string;
  requirementId?: string;
  controlId?: string;
  actionPlanId?: string;
  createdAt: string;
}

export interface NonConformity {
  id: string;
  organizationId: string;
  auditId?: string;
  description: string;
  requirementId?: string;
  severity: 'minor' | 'major' | 'critical';
  actionPlanId?: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlan {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  nonConformityId?: string;
  riskId?: string;
  ownerId?: string;
  deadline?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  tasks?: string[];
  evidences?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INCIDENTES E PROBLEMAS (ITIL)
// ============================================================================

export interface Incident {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  ownerId?: string;
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed';
  problemId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Problem {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  rootCause?: string;
  ownerId?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  incidents?: string[];
  actionPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Change {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  type: 'standard' | 'normal' | 'emergency';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  ownerId?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  window?: string;
  rollbackPlan?: string;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'rolled_back';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PROJETOS E TAREFAS (AGILE)
// ============================================================================

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  ownerId?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  epics?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  features?: string[];
}

export interface Feature {
  id: string;
  epicId: string;
  name: string;
  description?: string;
  userStories?: string[];
}

export interface UserStory {
  id: string;
  featureId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimate?: number;
  tasks?: string[];
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  actionPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COLABORAÇÃO
// ============================================================================

export interface Meeting {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  date: string;
  duration?: number;
  participants?: string[];
  relatedTo?: {
    type: 'audit' | 'risk' | 'incident' | 'problem' | 'change' | 'project' | 'vendor' | 'control' | 'non_conformity';
    id: string;
  };
  transcript?: string;
  decisions?: string[];
  tasks?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  organizationId: string;
  senderId: string;
  content: string;
  relatedTo?: {
    type: string;
    id: string;
  };
  createdAt: string;
}

// ============================================================================
// RADAR AI
// ============================================================================

export interface AIAgent {
  id: string;
  organizationId: string;
  type: 'risk' | 'compliance' | 'security' | 'privacy' | 'audit' | 'third_party' | 'continuity' | 'ai_governance' | 'itil' | 'agile' | 'evidence' | 'document';
  name: string;
  status: 'active' | 'inactive';
  autonomyLevel: 0 | 1 | 2 | 3;
  createdAt: string;
}

export interface AIMMission {
  id: string;
  organizationId: string;
  agentId: string;
  command: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  tasks?: string[];
  progress?: number;
  createdAt: string;
  completedAt?: string;
}

export interface AIMemory {
  id: string;
  organizationId: string;
  type: 'decision' | 'policy' | 'risk' | 'control' | 'audit' | 'project' | 'preference';
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INDICADORES
// ============================================================================

export interface Indicator {
  id: string;
  organizationId: string;
  type: 'kpi' | 'kri';
  name: string;
  description?: string;
  value: number;
  target?: number;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTIFICAÇÕES E LOGS
// ============================================================================

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'DOWNLOAD' | 'APPROVE' | 'REJECT' | 'UPLOAD' | 'AI_ACTION' | 'PERMISSION_CHANGE' | 'INTEGRATION_CHANGE' | 'BILLING_CHANGE';
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

// ============================================================================
// ASSINATURA E BILLING
// ============================================================================

export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  usersIncluded: number;
  additionalUsers: number;
  modules: string[];
  cycle: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface Usage {
  id: string;
  organizationId: string;
  month: string;
  users: number;
  modules: string[];
  storage: number;
  aiActions: number;
  createdAt: string;
}
