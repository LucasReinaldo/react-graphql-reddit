import { Arg, Query, Resolver } from 'type-graphql';
import Post from '../entities/Post';

@Resolver(Post)
export default class PostResolver {
  @Query(() => [Post], { nullable: false })
  async posts(): Promise<Post[] | undefined> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => String) id: string): Promise<Post | undefined> {
    return Post.findOne({ id });
  }
}
