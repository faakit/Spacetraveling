import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Head from 'next/head';
import { ReactElement, useState } from 'react';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps): ReactElement {
  const { postsPagination } = props;
  const [results, setResults] = useState(postsPagination.results);
  const [next_page, setNext_page] = useState(postsPagination.next_page);

  function loadNext(): void {
    fetch(next_page)
      .then(res => res.json())
      .then(data => {
        const dataResults = data.results.map(post => post as Post);

        setNext_page(data.next_page);
        setResults([...results, ...dataResults]);
      });
  }

  return (
    <>
      <Head>
        <title>Home | SpaceTravelling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postInfos}>
                  <div className={styles.postInfo}>
                    <FiCalendar size={20} />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        "dd' 'MMM' 'yyyy",
                        { locale: ptBR }
                      )}
                    </time>
                  </div>
                  <div className={styles.postInfo}>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {next_page ? (
          <button type="button" className={styles.seeMore} onClick={loadNext}>
            Carregar mais posts
          </button>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 2,
    }
  );

  const results = postsResponse.results.map(post => {
    return post as Post;
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: { postsPagination },
  };
};
