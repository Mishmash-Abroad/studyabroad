from abc import ABC, abstractmethod

class TranscriptProvider(ABC):
    @abstractmethod
    def is_account_required(self) -> bool:
        pass

    @abstractmethod
    def validate_account(self, credentials: dict) -> bool:
        pass

    @abstractmethod
    def fetch_transcript(self, user) -> dict:
        pass
