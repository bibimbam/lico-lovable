# Lico (Little economy) - AI 기반 체험형 경제·금융 교육 서비스

Lovable 플랫폼을 활용하여 제작한 Lico 서비스의 프론트엔드.

현재 학교 경제·금융 교육은 턱없이 부족한 데다가 이론 중심으로 이루어져 실제 경제 활동을 경험할 기회가 부족하다.
또한 체험형 수업은 교사의 높은 운영 부담으로 확산에 한계가 있다.

Lico는 AI를 이용하여 교실 경제 시스템을 자동 생성·운영하도록 지원하여 교사의 부담을 줄이고, 학생들이 소득·소비·투자·납세를 직접 경험하며 경제·금융 역량을 기를 수 있도록 돕는다.
## 기술 스택 (Tech Stack)
### Upstage AI API
* **Solar LLM**: AI 어시스턴트로서, 교사의 서비스 운영 시 궁금한 점 혹은 학생의 경제 개념 관련 궁금한 점 등을 답해줌. Solar LLM을 API 키를 사용해 Lovable 내부적으로 연결하여 구현되도록 함.
* **Document Parse**: 교사가 교안을 PDF 형태로 AI 어시스턴트의 채팅란에 입력하면, AI가 해당 PDF에 있는 내용을 Document Parse를 이용해서 문서 추출 혹은 ocr을 진행해 텍스트로 변환.
* **Information Extract:** 교사가 업로드한 교안 PPT의 내용을 Information Extraction 기법을 활용하여 핵심 정보 중심으로 구조화. 구조화된 내용은 챗봇 응답 형태로 정리하여 화면에 제공.
### Lovable
프론트엔드 빌드 및 UI/UX 대시보드 구현
## 링크 (Links)
* 서비스 배포 주소: (https://lico-little-economy.lovable.app/)
