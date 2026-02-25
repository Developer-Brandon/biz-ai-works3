import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestAuthStore = defineStore("test-auth", () => {
  const testRandomEmail = ref("");
  const testPassword = ref("demo1234!!");

  const setRandomTestEmail = async (office) => {
    office = office?.toLowerCase();

    let testEmailList = [];

    switch (office) {
      case "oci":
        testEmailList = ["oci@demo.co.kr"];
        break;

      case "komsco":
        testEmailList = ["komsco@demo.co.kr"];
        break;

      case "krc":
        testEmailList = ["krc@demo.co.kr"];
        break;

      case "hira":
        testEmailList = ["hira@demo.co.kr"];
        break;

      case "kogas":
        testEmailList = ["kogas@demo.co.kr"];
        break;

      default:
        testEmailList = [];
        testPassword.value = "";
    }

    testRandomEmail.value = testEmailList[0];
  };

  return {
    setRandomTestEmail,
    testRandomEmail,
    testPassword,
  };
});
