import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getLocalizedValue, 
  getLocalizedArray,
  type Language,
  type LocalizedString,
  type LocalizedArray 
} from "@shared/localization";

export function useProfileLocalization() {
  const { language } = useLanguage();
  
  const getText = (value: LocalizedString | undefined, fallback: string = ""): string => {
    return getLocalizedValue(value, language as Language, fallback);
  };
  
  const getArray = (value: LocalizedArray | undefined, fallback: string[] = []): string[] => {
    return getLocalizedArray(value, language as Language, fallback);
  };
  
  return { 
    language: language as Language, 
    getText, 
    getArray 
  };
}
