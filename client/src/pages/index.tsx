import { Navbar } from "@/components/Navbar";
import { useMeQuery } from "@/generated/graphql";

const Index = () => {
  const [{ data }] = useMeQuery();

  return (
    <>
      <Navbar />
      <div>{data?.me?.username}</div>
    </>
  );
};

export default Index;
