const api = {
  lab: {
    groupchat: {
      completion: (payload) => {
        return fetch("/api/lab/groupchat/completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      gendescription: (payload) => {
        return fetch("/api/lab/groupchat/gendescription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
    },
  },
};

export default api;
