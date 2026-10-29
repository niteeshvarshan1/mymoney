
import { useState } from 'react';
import './App.css';

const localDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const initialTransactions = [
  { id: 1, name: 'Blinkit', category: 'Groceries', amount: 262, date: localDate(), type: 'expense' },
  { id: 2, name: 'Petrol', category: 'Transport', amount: 300, date: localDate(), type: 'expense' },
];

function readSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function App() {
  const [salary, setSalary] = useState(() =>
    Number(readSaved('mm-salary', 30000))
  );
  const [goal, setGoal] = useState(() =>
    Number(readSaved('mm-goal', 10000))
  );
  const [transactions, setTransactions] = useState(() =>
    readSaved('mm-transactions', initialTransactions)
  );

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(localDate());

  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const monthKey = localDate().slice(0, 7);
  const today = localDate();

  function saveTransactions(items) {
    setTransactions(items);
    localStorage.setItem('mm-transactions', JSON.stringify(items));
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const todaySpent = expenses
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpenses = expenses.filter(t => t.date.startsWith(monthKey));
  const monthSpent = monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // The salary setting is the main salary figure. Don't count a salary
  // transaction again as additional income.
  const extraIncome = incomes
    .filter(t => t.date.startsWith(monthKey) &&
      t.category !== 'Salary' &&
      !t.name.toLowerCase().includes('salary'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = salary + extraIncome - monthSpent;
  const savedAmount = Math.max(0, balance);
  const goalProgress = goal > 0
    ? Math.min(100, (savedAmount / goal) * 100)
    : 0;

  // Seven calendar days, including days with no expenses.
  const dailyData = Array.from({ length: 7 }, (_, index) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (6 - index));
    const key = localDate(d);
    return {
      key,
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      value: expenses
        .filter(t => t.date === key)
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  // Current month and five previous months.
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const d = new Date();
    d.setDate(1);
    d.setHours(12, 0, 0, 0);
    d.setMonth(d.getMonth() - (5 - index));
    const key = localDate(d).slice(0, 7);

    return {
      key,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      value: expenses
        .filter(t => t.date.startsWith(key))
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  function addTransaction(e) {
    e.preventDefault();
    const value = Number(amount);

    if (!name.trim() || !Number.isFinite(value) || value <= 0) return;

    saveTransactions([
      {
        id: Date.now(),
        name: name.trim(),
        category,
        amount: value,
        date,
        type,
      },
      ...transactions,
    ]);

    setName('');
    setAmount('');
  }

  function updateSalary(value) {
    const safeValue = Math.max(0, Number(value) || 0);
    setSalary(safeValue);
    localStorage.setItem('mm-salary', JSON.stringify(safeValue));
  }

  function updateGoal(value) {
    const safeValue = Math.max(0, Number(value) || 0);
    setGoal(safeValue);
    localStorage.setItem('mm-goal', JSON.stringify(safeValue));
  }

  const maxDaily = Math.max(1, ...dailyData.map(d => d.value));
  const maxMonthly = Math.max(1, ...monthlyData.map(d => d.value));

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>₹</span> MyMoney</div>
        <p className="side-label">YOUR FINANCES</p>
        <div className="nav-item active">▦ &nbsp; Overview</div>
        <a className="nav-item" href="#transactions">↔ &nbsp; Transactions</a>
        <a className="nav-item" href="#reports">▤ &nbsp; Reports</a>
        <a className="nav-item" href="#savings">♧ &nbsp; Savings</a>
        <div className="side-footer">Small savings.<br />Big future. 💚</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>My Dashboard 👋</h1>
            <p className="muted">Understand your money. Build better habits.</p>
          </div>
          <div className="avatar">M</div>
        </header>

        <section className="stats">
          <div className="stat salary-card">
            <p>Monthly salary</p>
            <h2>{money(salary)}</h2>
            <label htmlFor="salary">Change salary (₹)</label>
            <input id="salary" type="number" min="0" value={salary}
              onChange={e => updateSalary(e.target.value)} />
          </div>
          <div className="stat">
            <p>Spent today</p>
            <h2 className="red">{money(todaySpent)}</h2>
            <span className="hint">Today's expenses</span>
          </div>
          <div className="stat">
            <p>Spent this month</p>
            <h2>{money(monthSpent)}</h2>
            <span className="hint">Recorded expenses</span>
          </div>
          <div className="stat">
            <p>Estimated balance</p>
            <h2 className="green">{money(balance)}</h2>
            <span className="hint">Salary + extra income − expenses</span>
          </div>
        </section>

        <section className="charts" id="reports">
          <div className="panel chart-panel">
            <h3>Daily spending</h3>
            <p className="muted">Your last seven days</p>
            <div className="bar-chart">
              {dailyData.map(day => (
                <div className="bar-column" key={day.key} title={`${day.key}: ${money(day.value)}`}>
                  <span className="bar-value">{day.value ? money(day.value) : '—'}</span>
                  <div className="bar-track">
                    <div className="bar-fill"
                      style={{ height: `${day.value ? Math.max(4, day.value / maxDaily * 100) : 0}%` }} />
                  </div>
                  <span className="bar-label">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel chart-panel">
            <h3>Monthly spending</h3>
            <p className="muted">Compare the last six months</p>
            <div className="bar-chart monthly-chart">
              {monthlyData.map(month => (
                <div className="bar-column" key={month.key} title={`${month.key}: ${money(month.value)}`}>
                  <span className="bar-value">{month.value ? money(month.value) : '—'}</span>
                  <div className="bar-track">
                    <div className="bar-fill monthly-fill"
                      style={{ height: `${month.value ? Math.max(4, month.value / maxMonthly * 100) : 0}%` }} />
                  </div>
                  <span className="bar-label">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel savings-panel" id="savings">
          <div className="savings-top">
            <div>
              <p className="eyebrow">YOUR SAVINGS PLAN</p>
              <h3>Build your savings 🐷</h3>
              <p className="muted">Track your target against your estimated remaining money.</p>
            </div>
            <div className="savings-number">{Math.round(goalProgress)}%</div>
          </div>
          <div className="goal-values">
            <div><span className="muted">Estimated amount available</span><strong>{money(savedAmount)}</strong></div>
            <div><label htmlFor="goal">Savings target (₹)</label><input id="goal" type="number" min="0" value={goal} onChange={e => updateGoal(e.target.value)} /></div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
          </div>
          <p className="muted">
            {goal <= 0
              ? 'Enter a savings target above.'
              : savedAmount >= goal
                ? 'Your estimated available amount has reached your target!'
                : `${money(Math.max(0, goal - savedAmount))} more to reach your target.`}
          </p>
        </section>

        <section className="columns">
          <div className="panel">
            <h3>Add transaction</h3>
            <p className="muted">Record income or an expense.</p>
            <form onSubmit={addTransaction}>
              <label>Transaction type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <label>Description</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Blinkit order" required />

              <label>Amount (₹)</label>
              <input type="number" min="0.01" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="262" required />

              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option>Food</option><option>Groceries</option><option>Rent</option>
                <option>Transport</option><option>Shopping</option><option>Bills</option>
                <option>Salary</option><option>Other</option>
              </select>

              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              <button type="submit">+ Save transaction</button>
            </form>
          </div>

          <div className="panel" id="transactions">
            <div className="list-heading">
              <div><h3>Recent transactions</h3><p className="muted">Your recorded money movements</p></div>
              <span className="count">{transactions.length} records</span>
            </div>

            {transactions.length === 0 && <p className="muted">No transactions yet.</p>}

            {transactions.map(t => (
              <div className="transaction" key={t.id}>
                <div className="transaction-icon">{t.type === 'income' ? '↙' : '↗'}</div>
                <div className="transaction-info">
                  <strong>{t.name}</strong>
                  <span>{t.category} · {t.date}</span>
                </div>
                <strong className={t.type === 'income' ? 'green' : 'red'}>
                  {t.type === 'income' ? '+' : '−'}{money(Number(t.amount))}
                </strong>
                <button className="delete" title="Delete transaction" type="button"
                  onClick={() => saveTransactions(transactions.filter(item => item.id !== t.id))}>×</button>
              </div>
            ))}
          </div>
        </section>

        <p className="footnote">
          Estimates only, not a bank balance. Data is saved in this browser.
          Sample data is for demonstration. Back up important records separately.
        </p>
      </main>
    </div>
  );
}

export default App;
