import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import Post from '../entities/Post';

@Resolver(Post)
export default class PostResolver {
  @Query(() => [Post], { nullable: false })
  async posts(): Promise<Post[] | undefined> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => String) id: string): Promise<Post | null> {
    const post = await Post.findOne({ id });

    if (!post) {
      return null;
    }

    return post;
  }

  @Mutation(() => Post)
  async createPost(@Arg('title', () => String) title: string): Promise<Post> {
    const createdPost = await Post.create({ title }).save();

    return createdPost;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: string,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ id });

    if (!post) {
      return null;
    }

    post.title = title;
    await Post.save(post);

    return post;
  }

  @Mutation(() => Post)
  async deletePost(@Arg('id') id: string): Promise<Post | null> {
    const post = await Post.findOne({ id });

    if (!post) {
      return null;
    }

    await Post.delete({ id });

    return post;
  }
}
