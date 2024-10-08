'use client';

import useGeneralStore from '@/stores/general';
import { useShallow } from 'zustand/react/shallow';
import { t } from '@/stores/language';

export default function CreateLinkModal() {
  const { name, setName, destinationURL, setDestinationURL } = useGeneralStore(useShallow(state => ({
    name: state.createLinkModal.name,
    setName: state.createLinkModal.setName,
    destinationURL: state.createLinkModal.destinationURL,
    setDestinationURL: state.createLinkModal.setDestinationURL
  })));

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex flex-col'>
        <h2 className='text-sm font-semibold text-secondary'>
          {t('accountPage.tabs.myLinks.createLinkModal.inputs.name.label')}
        </h2>

        <p className='text-xs text-tertiary'>
          {t('accountPage.tabs.myLinks.createLinkModal.inputs.name.description')}
        </p>
            
        <input
          type="text"
          placeholder={t('accountPage.tabs.myLinks.createLinkModal.inputs.name.placeholder')}
          className="w-full px-3 py-2 mt-3 text-sm transition-all outline-none placeholder-placeholder text-secondary bg-secondary hover:bg-background focus-visible:bg-background hover:ring-2 ring-purple-500 rounded-xl"
          value={name}
          onChange={event => setName(event.target.value)}
        />
      </div>

      <div className='flex flex-col'>
        <h2 className='text-sm font-semibold text-secondary'>
          {t('accountPage.tabs.myLinks.createLinkModal.inputs.destinationUrl.label')}
        </h2>

        <p className='text-xs text-tertiary'>
          {t('accountPage.tabs.myLinks.createLinkModal.inputs.destinationUrl.description')}
        </p>
            
        <input
          type="text"
          placeholder={t('accountPage.tabs.myLinks.createLinkModal.inputs.destinationUrl.placeholder')}
          className="w-full px-3 py-2 mt-3 text-sm transition-all outline-none placeholder-placeholder text-secondary bg-secondary hover:bg-background focus-visible:bg-background hover:ring-2 ring-purple-500 rounded-xl"
          value={destinationURL}
          onChange={event => setDestinationURL(event.target.value)}
        />
      </div>
    </div>
  );
}