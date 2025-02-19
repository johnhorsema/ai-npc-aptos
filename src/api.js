const api = {
  chat: {
    completion: (payload) => {
      return fetch("/api/chat/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        return response.json();
      });
    },
    history: () => {
      return fetch("/api/chat/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        return response.json();
      });
    },
    daily: () => {
      return fetch("/api/chat/daily").then((response) => {
        return response.json();
      });
    },
    collect: {
      clip: (payload) => {
        return fetch("/api/chat/collect/clip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          return response.json();
        });
      },
    },
  },
  admin: {
    stats: () => {
      return fetch("/api/admin/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    eqstats: () => {
      return fetch("/api/admin/eqstats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    users: {
      list: () => {
        return fetch("/api/admin/users/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      active: () => {
        return fetch("/api/admin/users/active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
    },
    chats: {
      list: () => {
        return fetch("/api/admin/chats/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      topics: () => {
        return fetch("/api/admin/chats/topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      context: () => {
        return fetch("/api/admin/chats/context", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      eqAnalyze: (payload) => {
        return fetch("/api/admin/chats/eqanalyze", {
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
      eqlist: (payload) => {
        return fetch("/api/admin/chats/eqlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
    },
    tokenusage: () => {
      return fetch("/api/admin/tokenusage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    dailyusage: () => {
      return fetch("/api/admin/dailyusage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    report: {
      tags: () => {
        return fetch("/api/admin/report/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      active_user: (payload) => {
        return fetch("/api/admin/report/active_user", {
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
    backup: () => {
      return fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
  },
  moderator: {
    stats: () => {
      return fetch("/api/moderator/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    eqstats: () => {
      return fetch("/api/moderator/eqstats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    users: {
      list: () => {
        return fetch("/api/moderator/users/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      active: () => {
        return fetch("/api/moderator/users/active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      create: (payload) => {
        return fetch("/api/moderator/users/create", {
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
      bulkcreate: (payload) => {
        return fetch("/api/moderator/users/bulkcreate", {
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
      sendactivations: (payload) => {
        return fetch("/api/moderator/users/sendactivations", {
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
      resetpw: (payload) => {
        return fetch("/api/moderator/users/resetpw", {
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
    chats: {
      list: () => {
        return fetch("/api/moderator/chats/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      topics: () => {
        return fetch("/api/moderator/chats/topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      eqAnalyze: (payload) => {
        return fetch("/api/moderator/chats/eqanalyze", {
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
      eqlist: (payload) => {
        return fetch("/api/moderator/chats/eqlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
    },
    credit: {
      transfer: (payload) => {
        return fetch("/api/moderator/credit/transfer", {
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
      bulktransfer: (payload) => {
        return fetch("/api/moderator/credit/bulktransfer", {
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
    notification: {
      count: () => {
        return fetch("/api/moderator/notification/count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      get: () => {
        return fetch("/api/moderator/notification/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      update: {
        status: (payload) => {
          return fetch("/api/moderator/notification/update/status", {
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
        comment: (payload) => {
          return fetch("/api/moderator/notification/update/comment", {
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
    report: {
      tags: () => {
        return fetch("/api/moderator/report/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      active_user: (payload) => {
        return fetch("/api/moderator/report/active_user", {
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
  editor: {
    chats: {
      list: () => {
        return fetch("/api/editor/chats/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      context: () => {
        return fetch("/api/editor/chats/context", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
    },
    library: {
      list: () => {
        return fetch("/api/editor/library/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      search: (payload) => {
        return fetch("/api/editor/library/search", {
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
    staging: {
      list: () => {
        return fetch("/api/editor/library/staging/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      search: (payload) => {
        return fetch("/api/editor/library/staging/search", {
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
      publish: () => {
        return fetch("/api/editor/library/staging/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data;
          });
      },
      reset: () => {
        return fetch("/api/editor/library/staging/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
    },
  },
  profile: {
    info: () => {
      return fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
  },
  share: {
    add: (payload) => {
      return fetch("/api/share/add", {
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
    remove: (payload) => {
      return fetch("/api/share/remove", {
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
  letter: {
    monthly: () => {
      return fetch("/api/letter/monthly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    collected: () => {
      return fetch("/api/letter/collected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
    all: () => {
      return fetch("/api/letter/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
  },
  diary: {
    add: (payload) => {
      return fetch("/api/diary/add", {
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
    all: () => {
      return fetch("/api/diary/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return data;
        });
    },
  },
};

export default api;
