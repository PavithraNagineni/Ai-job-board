import os
import time
import mlflow
from typing import Optional
from state.research_state import ResearchState


def setup_mlflow():
    """Configure MLflow tracking URI from environment."""
    tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("multi_agent_research_system")
    print(f"[MLflow] Tracking URI: {tracking_uri}")


def start_run(topic: str) -> str:
    """Start an MLflow run and return the run ID."""
    setup_mlflow()
    run = mlflow.start_run(run_name=f"research_{topic[:40].replace(' ', '_')}")
    mlflow.log_param("topic", topic)
    mlflow.log_param("model", os.getenv("MODEL_NAME", "gpt-4o-mini"))
    mlflow.log_param("max_iterations", os.getenv("MAX_RESEARCH_ITERATIONS", 3))
    print(f"[MLflow] Run started: {run.info.run_id}")
    return run.info.run_id


def log_iteration(state: ResearchState):
    """Log metrics after each research+critique iteration."""
    iteration = state.get("iteration", 0)
    mlflow.log_metric("iterations_completed", iteration, step=iteration)
    mlflow.log_metric("sources_found", len(state.get("sources", [])), step=iteration)
    mlflow.log_metric("findings_length", sum(
        len(f) for f in state.get("raw_findings", [])
    ), step=iteration)
    mlflow.log_metric("is_sufficient", int(state.get("is_sufficient", False)), step=iteration)

    if state.get("critique"):
        mlflow.log_text(state["critique"], f"critique_iter_{iteration}.txt")


def log_final_report(state: ResearchState):
    """Log the final report and close the MLflow run."""
    report = state.get("final_report", "")
    mlflow.log_metric("final_report_length", len(report))
    mlflow.log_metric("total_iterations", state.get("iteration", 0))
    mlflow.log_metric("total_sources", len(state.get("sources", [])))

    if report:
        mlflow.log_text(report, "final_report.md")

    # Log sources as artifact
    sources = state.get("sources", [])
    if sources:
        sources_text = "\n".join(sources)
        mlflow.log_text(sources_text, "sources.txt")

    mlflow.end_run()
    print(f"[MLflow] Run completed and logged.")


def end_run_on_error(error_msg: str):
    """End MLflow run with failed status on error."""
    mlflow.log_param("error", error_msg[:250])
    mlflow.end_run(status="FAILED")
