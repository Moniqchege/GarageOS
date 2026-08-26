export type JobStage = "diagnostics" | "active" | "parts" | "done";
export interface Vehicle { id:string; registration:string; model:string; year:number; color?:string; mileage:number; health?:number; }
export interface Customer { id:string; name:string; phone:string; email?:string; vehicleIds:string[]; }
export interface JobLine { type:"labor"|"part"; name:string; price:number; sku?:string; }
export interface JobDiagnosisFinding { id:string; label:string; severity:"ok"|"warning"|"danger"; note:string; }
export interface JobCard { id:string; registration:string; customer:string; phone:string; mechanic:string; stage:JobStage; startedAt:number; faults:string; lines?:JobLine[]; diagnosisNotes?:string; diagnosisFindings?:JobDiagnosisFinding[]; }
export interface LaborCharge { code:string; name:string; category:string; price:number; }

export interface Employee { id:string; name:string; role:string; phone:string; pin:string; status:"Active"|"Suspended"; lastLogin:string; }
export interface InventoryItem { sku:string; name:string; fits:string; cost:number; price:number; qty:number; low:number; added:string; }
export interface CustomerVehicleRecord { registration:string; customer:string; phone:string; model:string; mileage:number; lastService:string; nextServiceKm:number; nextServiceDate:string; }
export interface StaffNotification { level:"warning"|"danger"; text:string; }

export interface AppointmentEstimateLine { name:string; price:number; approved:boolean|null; }
export interface CustomerActiveJob { id:string; stage:JobStage; mechanic:string; faults:string; startedAt:number; estimate:AppointmentEstimateLine[]; awaitingApproval:boolean; }
export interface DiagnosticFinding { label:string; severity:"ok"|"warning"|"danger"; note:string; }
export interface ServiceHistoryEntry { date:string; desc:string; cost:number; invoice:string; }
export interface CustomerVehicle { registration:string; model:string; year:number; color:string; mileage:number; health:number; fuel:number; lastService:string; nextServiceDate:string; nextServiceKm:number; activeJob:CustomerActiveJob|null; diagnostics:DiagnosticFinding[]; history:ServiceHistoryEntry[]; }
export interface CustomerNotification { id:number; type:"job"|"reminder"|"promo"|"invoice"; read:boolean; time:string; title:string; body:string; }
