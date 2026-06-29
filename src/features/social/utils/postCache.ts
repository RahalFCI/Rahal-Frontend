/**
 * Cache helpers for posts. A post appears in several caches at once: the infinite
 * feed, the infinite user-posts list, and the single-post detail query. These
 * helpers patch/remove a post across all of them so optimistic like/delete stays
 * consistent without a refetch. Also flattens + de-dupes infinite feed pages
 * (de-dupe guards against the seconds-granular cursor — review #9).
 */
import type { QueryClient } from '@tanstack/react-query';
import type { Post, FeedPage } from '../api/schemas';

type InfiniteFeed = { pages: FeedPage[]; pageParams: unknown[] };

/** Apply an update (partial or updater fn) to a post wherever it is cached. */
export function applyPostPatch(
  queryClient: QueryClient,
  postId: string,
  patch: Partial<Post> | ((post: Post) => Partial<Post>),
): void {
  const merge = (p: Post): Post => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) });

  queryClient.setQueriesData({ queryKey: ['social'] }, (old: unknown) => {
    if (!old || typeof old !== 'object') return old;

    // Infinite feed / user-posts shape.
    if ('pages' in old) {
      const feed = old as InfiniteFeed;
      return {
        ...feed,
        pages: feed.pages.map((page) =>
          page && Array.isArray(page.posts)
            ? { ...page, posts: page.posts.map((p) => (p.id === postId ? merge(p) : p)) }
            : page,
        ),
      };
    }

    // Single-post detail shape.
    if ('id' in old && (old as Post).id === postId && 'likesCount' in old) {
      return merge(old as Post);
    }

    return old;
  });
}

/** Remove a post from every infinite list (used after delete). */
export function removePostFromLists(queryClient: QueryClient, postId: string): void {
  queryClient.setQueriesData({ queryKey: ['social'] }, (old: unknown) => {
    if (!old || typeof old !== 'object' || !('pages' in old)) return old;
    const feed = old as InfiniteFeed;
    return {
      ...feed,
      pages: feed.pages.map((page) =>
        page && Array.isArray(page.posts)
          ? { ...page, posts: page.posts.filter((p) => p.id !== postId) }
          : page,
      ),
    };
  });
}

/** Flatten infinite feed pages into a de-duped post array. */
export function flattenPosts(data: InfiniteFeed | undefined): Post[] {
  if (!data?.pages) return [];
  const seen = new Set<string>();
  const out: Post[] = [];
  for (const page of data.pages) {
    for (const post of page.posts ?? []) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        out.push(post);
      }
    }
  }
  return out;
}
