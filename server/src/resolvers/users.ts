import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { hash, verify } from 'argon2';

import { COOKIE_NAME } from '../constants';
import { MyContext } from '../types';

import User from '../entities/User';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export default class UserResolver {
  @Query(() => User, { nullable: false })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    if (!req.session.userId) {
      return undefined;
    }

    return User.findOne(req.session.userId);
  }

  @Query(() => [User], { nullable: false })
  async users(): Promise<User[] | undefined> {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async user(@Arg('id', () => String) id: string): Promise<User | null> {
    const user = await User.findOne({ id });

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Ctx() { req }: MyContext,
    @Arg('options') options: UsernamePasswordInput,
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username length must be greater than 2 char',
          },
        ],
      };
    }

    const findExistedUser = await User.findOne({
      where: { username: options.username },
    });

    if (findExistedUser) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username already exists',
          },
        ],
      };
    }

    const hashedPassword = await hash(options.password);

    const createdUser = await User.create({
      username: options.username,
      password: hashedPassword,
    }).save();

    req.session.userId = createdUser.id;

    return { user: createdUser };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: { username: options.username },
    });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username does not exist',
          },
        ],
      };
    }

    const validPassword = await verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  // @Mutation(() => User)
  // async updateUser(
  //   @Arg('id') id: string,
  //   @Arg('username') username: string,
  //   @Arg('password') password?: string,
  // ): Promise<User | null> {
  // }

  @Mutation(() => User)
  async updateUser(
    @Arg('id') id: string,
    @Arg('options') options: UsernamePasswordInput,
  ): Promise<User | null> {
    const user = await User.findOne({ id });

    if (!user) {
      return null;
    }

    user.password = options?.password;
    user.username = options.username;

    await User.save(user);

    return user;
  }

  @Mutation(() => User)
  async deleteUser(@Arg('id') id: string): Promise<User | null> {
    const user = await User.findOne({ id });

    if (!user) {
      return null;
    }

    await User.delete({ id });

    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req._destroy(null, (err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      }),
    );
  }
}
