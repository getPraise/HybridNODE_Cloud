from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Dict

class HybridNodeState(BaseModel):
    prompt: str = Field(..., min_length=1, description="The raw user requirement")
    complexity_score: int = Field(default=0, ge=0, le=100)
    
    # FIXED: Changed 'default==' to 'default='
    execution_tier: str = Field(default="LOCAL_1B", pattern="^(LOCAL_1B|LOCAL_3B|LOCAL_8B|CLOUD)$")

    refined_prompt: Optional[str] = None
    code_artifact: Optional[str] = None

    retry_count: int = Field(default=0, ge=0, le=3, strict=True)
    error_logs: List[str] = Field(default_factory=list)
    is_successful: bool = False

    status: str = "initialized"
    session_id: Optional[str] = None

    @model_validator(mode='after')
    def check_cloud_refinement_logic(self):
        # Professional check: Ensures Cloud tasks are properly 'refined' before execution
        if self.execution_tier == "CLOUD" and self.status == "EXECUTING" and not self.refined_prompt:
            raise ValueError("Cloud execution requires a refined prompt from 8B model")
        return self
    
    @field_validator('status', 'execution_tier')
    @classmethod
    def to_upper_case(cls, v: str):
        # Logic: Forces both status and tier to UPPERCASE to prevent regex mismatches
        return v.upper()