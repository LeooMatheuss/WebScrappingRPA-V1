import { remote } from "webdriverio";
import cheerio from "cheerio";

const url =
  "https://sec.tjmt.jus.br/primeiro-grau/certidao-negativa-pessoa-fisica";

(async () => {
  try {
    const browser = await remote({
      capabilities: {
        browserName: "chrome",
        "goog:chromeOptions": {
          args: ["-start-maximized"],
        },
      },
    });

    const typeAction = {
      "FALÊNCIA E CONCORDATA": 0,
      "RECUPERAÇÃO JUDICIAL": 1,
      "RECUPERAÇÃO EXTRAJUDICIAL": 2,
      "INSOLVÊNCIA CIVIL": 3,
      "INVENTÁRIO": 4,
      "EXECUÇÃO FISCAL": 5,
      "AÇÕES POSSESSÓRIAS": 6,
      "TUTELA": 7,
      "CURATELA": 8,
      "INTERDIÇÃO": 9,
      "EXECUÇÃO CIVIL": 10,
      "IMPROBIDADE ADMINISTRATIVA": 11,
      "DIREITOS REAIS": 12,
    };

    async function pageIsCompleted() {
      await browser.pause(1000);
      const isCompleted = await browser.execute("return document.readyState");
      if (isCompleted !== "complete") {
        return await pageIsCompleted();
      }
    }

    async function allowDownloadPDF() {
      await browser.url("chrome://settings/content/pdfDocuments?search=pdf");
      const allowDownloadCommand = `
        var elPdf = document.querySelector("body > settings-ui").shadowRoot.querySelector("#main").shadowRoot.querySelector("settings-basic-page").shadowRoot.querySelector("#basicPage > settings-section.expanded > settings-privacy-page").shadowRoot.querySelector("#pages > settings-subpage.iron-selected > div > settings-radio-group > settings-collapse-radio-button:nth-child(1)").shadowRoot.querySelector("#label");
        var pdf = elPdf.getAttribute('aria-pressed');
        if (!JSON.parse(pdf)) elPdf.click();`;
      await browser.pause(1000);
      await browser.execute(allowDownloadCommand);
    }

    await allowDownloadPDF();
    await pageIsCompleted();
    await browser.url(url);
    await pageIsCompleted();

    const dados = {
      nome: "xxxxxxx",
      datanascimento: "xxxxxxx",
      cpf: "xxxxxxxx",
      type: "civel",
      filterTypeAction: "AÇÕES POSSESSÓRIAS",
    };

    const documentCPF = "#documentoRequerido";
    await browser.$(documentCPF).setValue(dados.cpf);

    const documentDataNascimento = "#dataNascimento";
    await browser.$(documentDataNascimento).setValue(dados.datanascimento);
    await browser.$$('[class*="ant-select-selection"]')[0].click();
    const typeCertificate = dados.type === "criminal" ? 0 : 1;
    await browser
      .$$('[class="ant-select-tree-checkbox-inner"]')
      [typeCertificate].click();

    await browser.$$('[class*="ant-select-selection"]')[1].click();
    let positionAction = typeAction[dados.filterTypeAction];
    console.log(positionAction);
    await browser
      .$$(".ant-select-tree li ul li")
      [positionAction].$$("span")[1]
      .click();

    const isDisplayed = await browser.isDisplayed();
    console.log(isDisplayed); // outputs: false

    await browser.deleteSession();
  } catch (error) {
    console.error("Error:", error);
  }
})();
