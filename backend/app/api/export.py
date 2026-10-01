from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.export_service import export_service

router = APIRouter(prefix="/export", tags=["Export"])

class ExportRequest(BaseModel):
    title: str
    content: str
    format: str # pdf, docx, md, txt, json
    metadata: Optional[Dict[str, Any]] = None

@router.post("/download")
async def download_export(req: ExportRequest):
    fmt = req.format.lower()
    safe_title = "".join(c for c in req.title if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")

    if fmt == "md":
        content = export_service.export_to_markdown(req.title, req.content, req.metadata)
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.md"'}
        )
    elif fmt == "txt":
        return Response(
            content=req.content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.txt"'}
        )
    elif fmt == "docx":
        stream = export_service.export_to_docx(req.title, req.content, req.metadata)
        return Response(
            content=stream.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.docx"'}
        )
    elif fmt == "pdf":
        try:
            stream = export_service.export_to_pdf(req.title, req.content, req.metadata)
            return Response(
                content=stream.getvalue(),
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.pdf"'}
            )
        except Exception as e:
            # Fallback text if pdf engine encountered special character issue
            return Response(
                content=req.content,
                media_type="text/plain",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.txt"'}
            )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format.")
