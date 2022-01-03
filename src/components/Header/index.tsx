import { ReactElement } from 'react';

import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={commonStyles.container}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
