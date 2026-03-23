import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubmissionInput {
    name: string;
    email: string;
    message: string;
    projectDetails: string;
}
export type Time = bigint;
export interface Submission {
    name: string;
    email: string;
    message: string;
    timestamp: Time;
    projectDetails: string;
}
export type SubmissionId = bigint;
export interface backendInterface {
    getAllSubmissions(): Promise<Array<Submission>>;
    getSubmission(id: SubmissionId): Promise<Submission | null>;
    submitInquiry(input: SubmissionInput): Promise<SubmissionId>;
}
