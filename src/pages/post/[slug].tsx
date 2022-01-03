import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactElement } from 'react';
import Head from 'next/head';

import Prismic from '@prismicio/client';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const timeToRead = post.data.content.reduce((acc, content) => {
    const textBody = RichText.asText(content.body)
      .split(/<.+?>(.+?)<\/.+?>/g)
      .filter(t => t);

    const ar = [];
    textBody.forEach(fr => {
      fr.split(' ').forEach(pl => {
        ar.push(pl);
      });
    });

    const min = Math.ceil(ar.length / 200);
    return acc + min;
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTravelling</title>
      </Head>

      <Header />
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <div>
              <FiCalendar size={20} className={styles.icon} />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>
            <div>
              <FiUser size={20} className={styles.icon} />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock size={20} className={styles.icon} />
              <span>{timeToRead} min</span>
            </div>
          </div>
          {post.data.content.map(text => {
            const content = RichText.asHtml(text.body);

            return (
              <div className={styles.postContent} key={text.heading}>
                <h2 className={styles.postHeading}>{text.heading}</h2>
                <div
                  className={styles.postBody}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const { results } = posts;

  const paths = results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post = response as Post;

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
