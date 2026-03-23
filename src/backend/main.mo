import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

actor {
  type SubmissionId = Nat;

  type Submission = {
    name : Text;
    email : Text;
    projectDetails : Text;
    message : Text;
    timestamp : Time.Time;
  };

  module Submission {
    public func compareByTimestamp(submission1 : Submission, submission2 : Submission) : Order.Order {
      Int.compare(submission1.timestamp, submission2.timestamp);
    };
  };

  let submissions = Map.empty<SubmissionId, Submission>();
  var nextSubmissionId : SubmissionId = 0;

  public type SubmissionInput = {
    name : Text;
    email : Text;
    projectDetails : Text;
    message : Text;
  };

  public shared ({ caller }) func submitInquiry(input : SubmissionInput) : async SubmissionId {
    let id = nextSubmissionId;
    let submission : Submission = {
      input with
      timestamp = Time.now();
    };
    submissions.add(id, submission);
    nextSubmissionId += 1;
    id;
  };

  public query ({ caller }) func getAllSubmissions() : async [Submission] {
    submissions.values().toArray().sort(Submission.compareByTimestamp);
  };

  public query ({ caller }) func getSubmission(id : SubmissionId) : async ?Submission {
    submissions.get(id);
  };
};
