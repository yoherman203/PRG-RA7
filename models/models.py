from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]


class PartidaModel(BaseModel):
    """
    Model que representa una partida
    """

    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    # camps obligatoris
    username: str = Field(...)
    joc_nom: str = Field(...)
    puntuacio: int = Field(...)
    data_hora: datetime = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "partida": {
                "username": "Derek",
                "joc_nom": "Selecció en orde",
                "puntuacio": 80,
                "data_hora": datetime.now().strftime("%Y-%m-%d %H:%M"),
            }
        },
    )
