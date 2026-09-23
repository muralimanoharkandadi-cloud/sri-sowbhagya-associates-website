const finderData = {
  questions: [
    {
      id: "protect",
      title: "What are you primarily looking to focus on?",
      options: [
        { label: "Family Protection & Life Cover", next: "life_type" },
        { label: "Healthcare & Medical Expenses", next: "health_type" },
        { label: "Wealth Building & Mutual Funds", next: "investment_type" },
        { label: "Gold & Asset Diversification", next: "gold_type" },
        { label: "Vehicle or Property Protection", next: "asset_type" }
      ]
    },
    {
      id: "life_type",
      title: "What specific life protection goal do you have in mind?",
      options: [
        { label: "Pure High-Cover Income Replacement", category: "Term Insurance", link: "/insurance/life/" },
        { label: "Long-term Family Savings Planning", category: "Savings Plans", link: "/insurance/life/" },
        { label: "Children's Educational Protection", category: "Child Planning", link: "/insurance/life/" }
      ]
    },
    {
      id: "health_type",
      title: "Who requires healthcare coverage?",
      options: [
        { label: "Individual / Self", category: "Individual Health", link: "/insurance/health/" },
        { label: "Complete Family Coverage", category: "Family Floater", link: "/insurance/health/" },
        { label: "Senior Citizen Parents", category: "Senior Citizen Health", link: "/insurance/health/" }
      ]
    },
    {
      id: "investment_type",
      title: "What is your primary investment objective?",
      options: [
        { label: "Long-Term Capital Growth", category: "Equity Mutual Funds", link: "/mutual-funds/" },
        { label: "Disciplined Monthly Investing", category: "Systematic Investment Plans (SIP)", link: "/mutual-funds/" },
        { label: "Capital Preservation & Regularity", category: "Debt / Fixed Income Funds", link: "/mutual-funds/" }
      ]
    },
    {
      id: "gold_type",
      title: "How would you prefer to hold gold assets?",
      options: [
        { label: "Government Backed Bond Yields", category: "Sovereign Gold Bonds (SGB)", link: "/gold-investments/" },
        { label: "Exchange Traded Gold Units", category: "Gold ETFs", link: "/gold-investments/" },
        { label: "Flexible Mutual Fund Portfolios", category: "Gold Mutual Funds", link: "/gold-investments/" }
      ]
    },
    {
      id: "asset_type",
      title: "Which physical asset are you securing?",
      options: [
        { label: "Private Four Wheeler or Two Wheeler", category: "Motor Insurance", link: "/insurance/motor/" },
        { label: "Residential Home Structure & Contents", category: "Property Insurance", link: "/insurance/property/" }
      ]
    }
  ]
};

class NeedsFinder {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.currentStep = "protect";
    this.history = [];
    this.init();
  }

  init() {
    this.renderQuestion(this.currentStep);
  }

  renderQuestion(stepId) {
    const q = finderData.questions.find(item => item.id === stepId);
    if (!q) return;

    let html = `
      <div class="finder-step">
        <h3 style="font-size: 1.3rem; margin-bottom: 1.5rem; color: var(--primary);">${q.title}</h3>
        <div class="options-group">
    `;

    q.options.forEach(opt => {
      if (opt.next) {
        html += `<button class="option-btn" onclick="window.finder.navigate('${opt.next}')">${opt.label} →</button>`;
      } else {
        html += `<button class="option-btn" onclick="window.finder.showResult('${opt.category}', '${opt.link}')">${opt.label} ✓</button>`;
      }
    });

    if (this.history.length > 0) {
      html += `<button class="btn btn-secondary" style="margin-top: 1rem; color: var(--text-primary); border-color: var(--border-color);" onclick="window.finder.goBack()">← Back</button>`;
    }

    html += `</div></div>`;
    this.container.innerHTML = html;
  }

  navigate(nextStepId) {
    this.history.push(this.currentStep);
    this.currentStep = nextStepId;
    this.renderQuestion(nextStepId);
  }

  goBack() {
    if (this.history.length > 0) {
      this.currentStep = this.history.pop();
      this.renderQuestion(this.currentStep);
    }
  }

  showResult(category, link) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 1rem;">
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Suggested Area of Exploration</h3>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">Based on your input, you may want to review information on <strong>${category}</strong>.</p>
        <a href="${link}" class="btn btn-primary">Explore ${category} Solutions</a>
        <button class="btn btn-secondary" style="margin-left: 0.5rem; color: var(--text-primary); border-color: var(--border-color);" onclick="window.finder.reset()">Start Over</button>
      </div>
    `;
  }

  reset() {
    this.history = [];
    this.currentStep = "protect";
    this.init();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.finder = new NeedsFinder("interactive-finder-app");
});