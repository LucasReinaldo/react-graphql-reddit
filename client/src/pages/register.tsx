import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import Wrapper from "@/components/Wrapper";
import InputField from "@/components/InputField";

import { useRegisterMutation } from "@/generated/graphql";
import { toErrorMap } from "@/utils/toErrorMap";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  const handleSubmit = useCallback(async (values, setErrors) => {
    const response = await register(values);
    if (response.data?.createUser.errors) {
      setErrors(toErrorMap(response.data.createUser.errors));
    } else {
      router.push("/");
    }
  }, []);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values, { setErrors }) => handleSubmit(values, setErrors)}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="blue"
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
