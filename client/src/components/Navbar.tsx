import React from "react";
import NextLink from "next/link";
import { Box, Flex, Link } from "@chakra-ui/react";

export const Navbar: React.FC<{}> = ({}) => {
  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"} color="white" fontWeight={700} fontSize={18}>
        <NextLink href="/login">
          <Link m={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link m={2}>Register</Link>
        </NextLink>
      </Box>
    </Flex>
  );
};
