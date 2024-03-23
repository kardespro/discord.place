'use client';

import useThemeStore from '@/stores/theme';
import { nanoid } from 'nanoid';
import Link from 'next/link';
import { FaDiscord, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { MdDarkMode } from 'react-icons/md';
import { HiSun } from 'react-icons/hi';
import cn from '@/lib/cn';
import Image from 'next/image';

export default function Footer() {
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  const blocks = [
    {
      title: 'Our Services',
      links: [
        {
          label: 'Profiles',
          href: '/profiles'
        },
        {
          label: 'Servers',
          href: '/servers'
        },
        {
          label: 'Bots',
          href: '#',
          disabled: true
        },
        {
          label: 'Emojis',
          href: '/emojis'
        }
      ]
    },
    {
      title: 'Legal',
      links: [
        {
          label: 'Privacy Policy',
          href: '#',
          disabled: true
        },
        {
          label: 'Terms of Service',
          href: '#',
          disabled: true
        },
        {
          label: 'Cookie Policy',
          href: '#',
          disabled: true
        },
        {
          label: 'Content Policy',
          href: '/legal/content-policy'
        }
      ]
    },
    {
      title: 'Socials',
      links: [
        {
          label: 'Twitter',
          href: 'https://twitter.com',
          icon: FaTwitter
        },
        {
          label: 'Discord',
          href: 'https://discord.com',
          icon: FaDiscord
        },
        {
          label: 'LinkedIn',
          href: 'https://linkedin.com',
          icon: FaLinkedin
        }
      ]
    }
  ];

  return (
    <section className="flex flex-col 2xl:max-h-[566px] flex-wrap flex-1 w-full gap-16 px-6 py-16 mt-auto border-t 2xl:flex-row 2xl:gap-x-48 sm:px-24 xl:px-48 bg-secondary border-primary">
      <div className='flex flex-col gap-y-6 max-w-[400px] w-full'>
        <Image 
          src={theme === 'dark' ? '/symbol_white.png' : '/symbol_black.png'} 
          width={200} 
          height={200} 
          className='w-[48px] h-[48px]' 
          alt='discord.placeLogo' 
        />

        <h2 className='text-2xl font-bold text-primary max-w-[350px]'>
          All things related to Discord in one place.
        </h2>

        <span className='text-sm text-secondary'>
          discord.place, {new Date().getFullYear()}
        </span>
      </div>

      <div className='flex flex-wrap mobile:justify-between 2xl:w-[calc(100%_-_400px_-_12rem)] gap-8 sm:gap-16'>
        {blocks.map(block => (
          <div className='flex flex-col gap-y-6' key={nanoid()}>
            <h2 className='text-sm font-medium text-tertiary'>
              {block.title}
            </h2>

            <div className='flex flex-col gap-y-4'>
              {block.links.map(link => (
                <Link 
                  key={nanoid()}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-x-2 text-secondary w-max',
                    link.disabled ? 'pointer-events-none opacity-70' : 'hover:text-primary'
                  )}
                >
                  {link.icon && <link.icon />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='lg:mt-24 w-full h-[1px] bg-[rgb(var(--border-primary))]' />

      <div className='flex flex-col justify-between w-full gap-4 sm:flex-row'>
        <p className='text-sm text-tertiary'>
          &copy; {new Date().getFullYear()} discord.place. All rights reserved.
        </p>

        <div className='flex gap-x-2'>
          <button className={cn(
            'p-2 rounded-full',
            theme === 'dark' ? 'pointer-events-none bg-quaternary text-primary' : 'text-tertiary hover:bg-quaternary hover:text-primary'
          )} onClick={() => toggleTheme('dark')}>
            <MdDarkMode />
          </button>

          <button className={cn(
            'p-2 rounded-full',
            theme === 'light' ? 'pointer-events-none bg-quaternary text-primary' : 'text-tertiary hover:bg-quaternary hover:text-primary'
          )} onClick={() => toggleTheme('light')}>
            <HiSun />
          </button>
        </div>
      </div>
    </section>
  );
}