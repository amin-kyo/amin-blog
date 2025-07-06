import { getCollection } from 'astro:content';

export async function getAllTags() {
  const allPosts = await getCollection('blog');
  const uniqueTags = new Set<string>();
  allPosts.forEach(post => {
    post.data.tags?.forEach(tag => uniqueTags.add(tag));
  });
  return Array.from(uniqueTags);
}

export async function getPostsByTag(tag: string) {
  const allPosts = await getCollection('blog');
  return allPosts.filter(post => post.data.tags?.includes(tag));
}