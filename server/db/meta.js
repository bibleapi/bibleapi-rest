import { bcv_parser as BcvParcer } from 'bible-passage-reference-parser/js/en_bcv_parser';

const getMetaInfo = (translation) => {
  const bcv = new BcvParcer;
  const translationInfo = bcv.translation_info(translation);
  return translationInfo;
};

export { getMetaInfo }