/**
 * 非立即执行防抖函数
 * @param {Function} func
 * @param {number} delay
 * @returns
 */
function debounce(func, delay) {
  let timeout;
  return function () {
    const _this = this;
    const args = [...arguments];
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(_this, args);
    }, delay);
  };
}

const app = {
  csvData: [],
  cellData: [],
  CSVToJSON(csv) {
    const lines = csv.split("\r\n");
    const keys = lines[0].split(",");
    return lines.slice(1).map((line) => {
      return [line.split(",")[0], line.split(",").slice(1).join()].reduce(
        (acc, cur, i) => {
          const toAdd = {};
          toAdd[keys[i]] = cur;
          return { ...acc, ...toAdd };
        },
        {}
      );
    });
  },
  CSVToJSON2(csv) {
    const lines = csv.split("\n");
    const keys = lines[0].split(",");
    const _ = [];
    const ___ = lines.slice(1).map((line) => line.split(","));
    for (let index = 0; index < ___.length; index++) {
      const line = ___[index];
      const __ = {};
      for (let j = 0; j < keys.length; j++) {
        const element = keys[j];
        __[element] = line[j];
      }
      _.push(__);
    }
    return _;
  },
  loadCsv() {
    axios({
      method: "get",
      url: "./libs/whole_body_markers-2.csv",
    }).then((response) => {
      this.csvData = this.CSVToJSON(response.data);
    });
    axios({
      method: "get",
      url: "./libs/organ.json",
    }).then((response) => {
      this.cellData = response.data;
    });
  },
  openSuggar(keys) {
    document.querySelector(".js-sug").innerHTML = "";
    const keyCons = keys.map((it) => `<div class="item">${it.cell}</div>`);
    document.querySelector(".js-sug").innerHTML = keyCons.join("");
    document.querySelector(".js-sug").classList.remove("hide");
  },
  eventRegister() {
    document.querySelector(".js-one").oninput = (e) => {
      const data = document.querySelector(".js-one").value || "";
      // console.log(data);
      let keys = this.csvData.filter((it) => it.cell.indexOf(data) >= 0);
      if (keys.length == 0) {
        keys = [{ cell: "cell name is not founded" }];
      }
      // console.log(keys);
      this.openSuggar(keys);

      if (document.querySelector(".js-one").value == "") {
        document.querySelector(".js-tree").innerHTML = "";
        document.querySelector(".js-markers").innerHTML = "";
      }
    };

    document.querySelector(".app").onclick = (e) => {
      if (
        e.target.classList.contains("js-inp") ||
        e.target.classList.contains("js-sug")
      ) {
        return;
      }
      document.querySelector(".js-sug").classList.add("hide");
    };

    document.querySelector(".js-sug").onclick = (e) => {
      // console.log(e.target);
      if ("cell name is not founded" === e.target.innerText.trim()) {
        return;
      }
      document.querySelector(".js-one").value = e.target.innerText.trim();
      document.querySelector(".js-sug").classList.add("hide");
      this.showMarkers();
    };

    document.querySelector(".js-markers").onclick = (e) => {
      if (e.target.classList.contains("marker")) {
        this.showTissues(e.target);
      }
    };
    document.querySelector(".js-back").onclick = (e) => {
      document.querySelector(".js-gray-1").classList.toggle("hide");
      document.querySelector(".js-gray-2").classList.toggle("hide");
    };
    // .js-many
    document.querySelector(".js-many").onchange = (e) => {
      this.showMarkers();
    };

    document.querySelector(".js-tree").onclick = (e) => {
      if (e.target.classList.contains("js-ine")) {
        // this.showMarkers();
        e.target.parentNode
          .querySelector(".nested-list")
          .classList.toggle("hide");
      }
    };
  },
  showTissues(el) {
    document.querySelector(".js-tissues").innerHTML = "";
    const data = el.innerText.trim();
    document.querySelector(".js-celln").innerHTML = data;
    const usss = this.cellData.map((it) => ({
      t: it.title,
      val: it[`${data}`],
    }));

    usss.sort((a, b) => +b.val - +a.val);
    window.us = usss;
    const markers = usss.slice(0, 10);
    if (markers) {
      const keyCons = markers.map((it) => `<div class="tissue">${it.t}</div>`);
      document.querySelector(".js-tissues").innerHTML = keyCons.join("");
    }
    document.querySelector(".js-gray-1").classList.toggle("hide");
    document.querySelector(".js-gray-2").classList.toggle("hide");
  },
  showMarkers() {
    document.querySelector(".js-markers").innerHTML = "";
    const data = document.querySelector(".js-one").value;
    const markers = this.csvData.filter((it) => it.cell.trim() == data.trim());
    // console.log(markers);
    if (markers && markers[0].markers) {
      let _ = markers[0].markers.match(/\'(.*?)\'/g);
      _ = _.slice(0, +document.querySelector(".js-many").value ?? 0);
      _ = _.map((it) => it.replace(/\'/g, ""));
      const keyCons = _.map((it) => `<div class="marker">${it}</div>`);
      document.querySelector(".js-markers").innerHTML = keyCons.join("");
    }

    document.querySelector(".js-gray-1").classList.remove("hide");
    document.querySelector(".js-gray-2").classList.remove("hide");
    document.querySelector(".js-gray-2").classList.add("hide");
  },
  initTree() {
    function gen(_) {
      return `
  <div class="item ">
  <span class="item-name js-ine">${
    _.name
  }</span><span class="item-count js-ine">(${_.children.length})</span>
  <ul class="nested-list hide">
      ${_.children
        .map(
          (itt) => `
        <div class="item"><span class="item-name">${itt.name}</span>
      </div>
        `
        )
        .join("")}
  </ul>
</div>
  `;
    }

    document.querySelector(".js-tree").innerHTML = "";
    const treeMap = tree.map((it) => gen(it)).join("");
    document.querySelector(".js-tree").innerHTML = treeMap;
  },
  init() {
    this.loadCsv();
    this.eventRegister();
    this.initTree();
  },
};

app.init();
