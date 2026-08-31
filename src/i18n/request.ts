import { getRequestConfig } from 'next-intl/server';
import itMessages from '../messages/it.json';

export default getRequestConfig(async () => {
  const locale = 'it';

  return {
    locale,
    messages: itMessages,
  };
});
