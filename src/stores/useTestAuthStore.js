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
        testEmailList = [
          "komsco@demo.co.kr",
          "komsco_dev@demo.co.kr",
          "komsco_admin@demo.co.kr",
        ];
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

    const shuffled = [...testEmailList];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    testRandomEmail.value = shuffled[0];
  };

  return {
    setRandomTestEmail,
    testRandomEmail,
    testPassword,
  };
});
