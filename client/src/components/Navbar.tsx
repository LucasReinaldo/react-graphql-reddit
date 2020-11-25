import React from "react";
import NextLink from "next/link";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useMeQuery } from "@/generated/graphql";

export const Navbar: React.FC<{}> = ({}) => {
  const [{ data, fetching }] = useMeQuery();

  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"} color="white" fontWeight={700} fontSize={18}>
        {fetching || !data?.me ? (
          <></>
        ) : data?.me ? (
          <Flex alignItems="center">
            <Box mr={2}>{data?.me?.username}</Box>
            <Button>Logout</Button>
          </Flex>
        ) : (
          <>
            <NextLink href="/login">
              <Link m={2}>Login</Link>
            </NextLink>
            <NextLink href="/register">
              <Link m={2}>Register</Link>
            </NextLink>
          </>
        )}
      </Box>
    </Flex>
  );
};
