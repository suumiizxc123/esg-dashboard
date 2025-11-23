import { IndicatorConfig } from "@/types";

export const indicators: IndicatorConfig[] = [
  {
    code: "E1",
    label: "Эрчим хүчний хэмнэлт",
    category: "Environment",
    description: "Эрчим хүчний хэрэглээ, сэргээгдэх эх үүсвэрийн хэрэглээ.",
    initialQuestion: "Танай сургууль эрчим хүчний хэрэглээгээ хэмждэг үү?",
    developmentQuestion:
      "Сэргээгдэх эх үүсвэр хэрэглэж байна уу, жилийн бууруулах зорилт тавьсан уу?",
    weight: 1.2,
    impact: 0.85,
  },
  {
    code: "E2",
    label: "Хүлэмжийн хийн ялгарал",
    category: "Environment",
    description: "Scope 1/2/3 тооцоолол, SBTi эсвэл Net Zero зорилго.",
    initialQuestion:
      "Нүүрстөрөгчийн ялгарлын талаар мэдээлэл вэб дээр байдаг уу?",
    developmentQuestion:
      "Scope 1,2,3 ялгарлыг тооцож, албан ёсны зорилготой болсон уу?",
    weight: 1.1,
    impact: 0.95,
  },
  {
    code: "E3",
    label: "Ногоон кампус",
    category: "Environment",
    description: "Ногоон дэд бүтэц, талбай, ногоон барилгын гэрчилгээ.",
    initialQuestion: "Кампусын талбай, ногоон талбайн хэмжээ (м²) байдаг уу?",
    developmentQuestion:
      "Ногоон барилгын гэрчилгээ эсвэл ногоон талбай/оюутан >10 м² байна уу?",
    weight: 1,
    impact: 0.75,
  },
  {
    code: "E4",
    label: "Усны хэрэглээ",
    category: "Environment",
    description: "Усны хэрэглээний хяналт, дахин ашиглах систем.",
    initialQuestion: "Зарцуулсан усны хэрэглээгээ хэмждэг үү?",
    developmentQuestion:
      "Сар бүр хэмждэг, дахин ашиглах системтэй (борооны ус г.м) юу?",
    weight: 0.9,
    impact: 0.72,
  },
  {
    code: "E5",
    label: "Хог хаягдлын менежмент",
    category: "Environment",
    description:
      "Хог ангилалт, дахин боловсруулалтын хувь, төрлөөр тайлагнал.",
    initialQuestion: "Хогийг ангилж цуглуулдаг уу?",
    developmentQuestion:
      "Төрлөөр тайлагнадаг уу, дахин боловсруулалтын хувь 40%-аас дээш үү?",
    weight: 1,
    impact: 0.68,
  },
  {
    code: "E6",
    label: "Био олон янз байдал",
    category: "Environment",
    description:
      "Кампус доторх ургамал, амьтны судалгаа, менежментийн төлөвлөгөө.",
    initialQuestion: "Кампус дотор мод тарьдаг уу, вэб дээрээ бичсэн үү?",
    developmentQuestion:
      "Био олон янз байдлын судалгаа, төлөвлөгөөтэй болсон уу?",
    weight: 0.85,
    impact: 0.6,
  },
  {
    code: "E7",
    label: "Нийлүүлэлтийн сүлжээ",
    category: "Environment",
    description: "Тогтвортой худалдан авалт, нийлүүлэгчийн ESG үнэлгээ.",
    initialQuestion:
      "Худалдан авалтын гэрээнд ногоон шаардлага тавьдаг уу?",
    developmentQuestion:
      "Нийлүүлэгчдээс ESG үнэлгээ шаарддаг уу, бодлоготой юу?",
    weight: 0.9,
    impact: 0.55,
  },
  {
    code: "S1",
    label: "Судалгааны чадамж",
    category: "Education",
    description: "Scopus/Web of Science бүтээл, нийгмийн нөлөөллийн хэмжилт.",
    initialQuestion: "Олон улсын баазад нийтлэл байгаа юу?",
    developmentQuestion:
      "Судалгааны нийгмийн нөлөөллийг хэмждэг үү (Altmetric г.м)?",
    weight: 0.85,
    impact: 0.48,
  },
  {
    code: "S2",
    label: "Эрх тэгш байдал",
    category: "Social",
    description: "Жендер ба хүртээмжийн мэдээлэл, индекс эсвэл тайлан.",
    initialQuestion:
      "Жендер, ХБЭҮ талаарх мэдээлэл вэб дээр бий юу?",
    developmentQuestion:
      "Эрх тэгш байдлын индекс эсвэл жил тутмын тайлан гаргадаг уу?",
    weight: 0.9,
    impact: 0.62,
  },
  {
    code: "S3",
    label: "Тогтвортой хөгжлийн боловсрол",
    category: "Education",
    description: "ТХБ/ESD агуулга, заавал хөтөлбөр, гэрчилгээ.",
    initialQuestion:
      "ТХБ-ийн талаар хичээл, сургалт явуулдаг уу?",
    developmentQuestion:
      "Бүх оюутанд заавал үздэг эсвэл UNESCO ESD гэрчилгээтэй юу?",
    weight: 1,
    impact: 0.7,
  },
  {
    code: "S4",
    label: "Багш, ажилтны хөгжил",
    category: "Social",
    description:
      "Дотоод сургалт, хөгжлийн төлөвлөгөө, сэтгэл ханамжийн судалгаа.",
    initialQuestion: "Ажилтнуудад сургалт явуулдаг уу?",
    developmentQuestion:
      "Хөгжлийн төлөвлөгөө, KPI, сэтгэл ханамжийн судалгаа жил бүр хийдэг үү?",
    weight: 0.9,
    impact: 0.52,
  },
  {
    code: "S5",
    label: "Нийгмийн оролцоо",
    category: "Social",
    description: "Нийгмийн арга хэмжээ, нөлөөллийн хэмжилт.",
    initialQuestion:
      "Жилд ямар нэг нийгмийн арга хэмжээ зохиодог уу?",
    developmentQuestion:
      "Нийгмийн нөлөөллийг (Social ROI г.м) хэмждэг үү?",
    weight: 0.75,
    impact: 0.45,
  },
  {
    code: "S6",
    label: "ХАБЭА",
    category: "Social",
    description: "Хөдөлмөрийн аюулгүй байдал, ISO 45001, ослын статистик.",
    initialQuestion:
      "ХАБЭА-гийн бодлого баримт бичиг вэб дээр байна уу?",
    developmentQuestion:
      "ISO 45001 эсвэл ослын тоо 3 жил дараалан буурсан уу?",
    weight: 0.85,
    impact: 0.58,
  },
  {
    code: "S7",
    label: "Оюутны үйлчилгээ",
    category: "Social",
    description: "Сэтгэл ханамжийн судалгаа, сэтгэцийн эрүүл мэндийн дэмжлэг.",
    initialQuestion:
      "Оюутны үйлчилгээн дээр сэтгэл ханамжийн судалгаа явуулдаг уу?",
    developmentQuestion:
      "Сэтгэцийн эрүүл мэндийн үйлчилгээ 100% хүртээмжтэй юу?",
    weight: 0.8,
    impact: 0.65,
  },
  {
    code: "S8",
    label: "Инновац ба гарааны компани",
    category: "Social",
    description: "Патент, гарааны компани, инновацын санхүүжилт.",
    initialQuestion: "Патент эсвэл гарааны компани байгуулсан уу?",
    developmentQuestion:
      "5+ гарааны компани, инновацын санхүүжилт жилд 100 сая₮+ байна уу?",
    weight: 0.95,
    impact: 0.66,
  },
  {
    code: "G1",
    label: "Засаглал ба удирдлага",
    category: "Governance",
    description: "ТХ/БОНЗ-ийн алба, хороо, төлөвлөгөө, тайлан.",
    initialQuestion:
      "ТХ/БОНЗ-ийн алба, хариуцсан хүнийг вэб дээр бичсэн үү?",
    developmentQuestion:
      "ТХ-ийн хороо байгуулагдсан, жилийн төлөвлөгөө, тайлан гардаг уу?",
    weight: 0.9,
    impact: 0.62,
  },
  {
    code: "G2",
    label: "Авилга, ёс зүй",
    category: "Governance",
    description: "Ёс зүйн дүрэм, ISO 37001, гадаад аудит.",
    initialQuestion: "Ёс зүйн дүрэм вэб дээрээ байна уу?",
    developmentQuestion:
      "ISO 37001 нэвтрүүлсэн эсвэл гадаад аудит хийлгэсэн үү?",
    weight: 1,
    impact: 0.8,
  },
  {
    code: "G3",
    label: "Санхүү ба хөрөнгө оруулалт",
    category: "Governance",
    description: "Жилийн санхүүгийн тайлан, ESG зардал, ногоон бонд.",
    initialQuestion: "Жилийн санхүүгийн тайлан вэб дээр байна уу?",
    developmentQuestion:
      "ESG зардлыг тусгасан, ногоон бонд/санхүүжилт татсан уу?",
    weight: 0.85,
    impact: 0.55,
  },
  {
    code: "G4",
    label: "Цахим дэд бүтэц ба түншлэл",
    category: "Governance",
    description: "Олон улсын түншлэл, төсөл, тайлагнал.",
    initialQuestion: "Олон улсын түншлэлтэй юу?",
    developmentQuestion:
      "ТХ/БОНЗ чиглэлийн олон улсын төсөл, тайлан гаргасан уу?",
    weight: 0.8,
    impact: 0.48,
  },
  {
    code: "G5",
    label: "Чанар ба эрсдэл",
    category: "Governance",
    description: "Эрсдэлийн жагсаалт, ISO 9001/31000, тайлан.",
    initialQuestion: "Эрсдэлийн жагсаалт бий юу?",
    developmentQuestion:
      "ISO 9001/31000 эсвэл эрсдэлийн тайлан жил бүр гардаг уу?",
    weight: 0.95,
    impact: 0.65,
  },
];

export const indicatorCodes = indicators.map((indicator) => indicator.code);

export const indicatorByCode = Object.fromEntries(
  indicators.map((indicator) => [indicator.code, indicator]),
);
