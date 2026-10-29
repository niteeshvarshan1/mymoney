
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
  const [activeSection, setActiveSection] = useState('overview');

  const money = value =>
    '₹' + Number(value).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });

  const today = localDate();
  const currentMonth = today.slice(0, 7);

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  function saveTransactions(items) {
    setTransactions(items);
    localStorage.setItem('mm-transactions', JSON.stringify(items));
  }

  const todaySpent = expenses
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthSpent = expenses
    .filter(t => t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const extraIncome = incomes
    .filter(t => t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = salary + extraIncome - monthSpent;
  const available = Math.max(0, balance);

  const goalProgress = goal > 0
    ? Math.min(100, (available / goal) * 100)
    : 0;

  const dailyData = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));

    const key = localDate(day);

    return {
      key,
      label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      value: expenses
        .filter(t => t.date === key)
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setDate(1);
    month.setHours(12, 0, 0, 0);
    month.setMonth(month.getMonth() - (5 - index));

    const key = localDate(month).slice(0, 7);

    return {
      key,
      label: month.toLocaleDateString('en-IN', { month: 'short' }),
      value: expenses
        .filter(t => t.date.startsWith(key))
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  function addTransaction(event) {
    event.preventDefault();

    const value = Number(amount);

    if (!name.trim() || !Number.isFinite(value) || value <= 0) {
      return;
    }

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
    setActiveSection('transactions');
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
  const maxMonthly = Math.max(1, ...monthlyData.map(m => m.value));

  function navigateTo(section) {
    setActiveSection(section);

    if (section === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const navigation = [
    { id: 'overview', icon: '⌂', label: 'Home' },
    { id: 'transactions', icon: '↔', label: 'Transactions' },
    { id: 'reports', icon: '▥', label: 'Reports' },
    { id: 'savings', icon: '♧', label: 'Savings' },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">₹</span>
          MyMoney
        </div>

        <p className="side-label">YOUR FINANCES</p>

        {navigation.map(item => (
          <button
            type="button"
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
          >
            {item.icon} &nbsp; {item.label}
          </button>
        ))}

        <div className="side-footer">
          Small savings.
          <br />
          Big future. 💚
        </div>
      </aside>

      <main className="main" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>My Dashboard 👋</h1>
            <p className="muted">
              Understand your money. Build better habits.
            </p>
          </div>
          <div className="avatar">M</div>
        </header>

        <section className="stats">
          <div className="stat salary-card">
            <p>Monthly salary</p>
            <h2>{money(salary)}</h2>
            <label htmlFor="salary">Change salary (₹)</label>
            <input
              id="salary"
              type="number"
              min="0"
              value={salary}
              onChange={event => updateSalary(event.target.value)}
            />
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
            <h2 className={balance < 0 ? 'red' : 'green'}>
              {money(balance)}
            </h2>
            <span className="hint">Salary + income − spending</span>
          </div>
        </section>

        <section className="charts" id="reports">
          <div className="panel chart-panel">
            <h3>Daily spending</h3>
            <p className="muted">Your last seven days</p>

            <div className="bar-chart">
              {dailyData.map(day => (
                <div
                  className="bar-column"
                  key={day.key}
                  title={`${day.key}: ${money(day.value)}`}
                >
                  <span className="bar-value">
                    {day.value ? money(day.value) : '—'}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${day.value ? Math.max(4, day.value / maxDaily * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="bar-label">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel chart-panel">
            <h3>Monthly spending</h3>
            <p className="muted">Your last six months</p>

            <div className="bar-chart monthly-chart">
              {monthlyData.map(month => (
                <div
                  className="bar-column"
                  key={month.key}
                  title={`${month.key}: ${money(month.value)}`}
                >
                  <span className="bar-value">
                    {month.value ? money(month.value) : '—'}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill monthly-fill"
                      style={{
                        height: `${month.value ? Math.max(4, month.value / maxMonthly * 100) : 0}%`,
                      }}
                    />
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
              <p className="muted">
                Compare your estimated available money with your target.
              </p>
            </div>
            <div className="savings-number">
              {Math.round(goalProgress)}%
            </div>
          </div>

          <div className="goal-values">
            <div>
              <span className="muted">Estimated available</span>
              <strong>{money(available)}</strong>
            </div>

            <div>
              <label htmlFor="goal">Savings target (₹)</label>
              <input
                id="goal"
                type="number"
                min="0"
                value={goal}
                onChange={event => updateGoal(event.target.value)}
              />
            </div>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Savings goal progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(goalProgress)}
          >
            <div
              className="progress-fill"
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <p className="muted">
            {goal <= 0
              ? 'Enter a savings target above.'
              : available >= goal
                ? 'Your estimated available amount has reached your target!'
                : `${money(goal - available)} more to reach your target.`}
          </p>
        </section>

        <section className="columns">
          <div className="panel" id="add-transaction">
            <h3>Add transaction</h3>
            <p className="muted">Record income or an expense.</p>

            <form onSubmit={addTransaction}>
              <label htmlFor="type">Transaction type</label>
              <select
                id="type"
                value={type}
                onChange={event => setType(event.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <label htmlFor="description">Description</label>
              <input
                id="description"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="e.g. Blinkit order"
                required
              />

              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder="262"
                required
              />

              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={event => setCategory(event.target.value)}
              >
                <option>Food</option>
                <option>Groceries</option>
                <option>Rent</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Salary</option>
                <option>Other</option>
              </select>

              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                required
              />

              <button className="primary-button" type="submit">
                + Save transaction
              </button>
            </form>
          </div>

          <div className="panel transactions-panel" id="transactions">
            <div className="list-heading">
              <div>
                <h3>Recent transactions</h3>
                <p className="muted">Your recorded money movements</p>
              </div>
              <span className="count">{transactions.length} records</span>
            </div>

            {transactions.length === 0 && (
              <p className="muted">No transactions yet. Add one to begin.</p>
            )}

            {transactions.map(transaction => (
              <div className="transaction" key={transaction.id}>
                <div className="transaction-icon">
                  {transaction.type === 'income' ? '↙' : '↗'}
                </div>

                <div className="transaction-info">
                  <strong>{transaction.name}</strong>
                  <span>
                    {transaction.category} · {transaction.date}
                  </span>
                </div>

                <strong className={transaction.type === 'income' ? 'green' : 'red'}>
                  {transaction.type === 'income' ? '+' : '−'}
                  {money(transaction.amount)}
                </strong>

                <button
                  className="delete"
                  type="button"
                  aria-label={`Delete ${transaction.name}`}
                  onClick={() =>
                    saveTransactions(
                      transactions.filter(item => item.id !== transaction.id)
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <p className="footnote">
          Estimates only, not a bank balance. Data is saved in this browser.
          Sample data is for demonstration. Keep a separate backup of important records.
        </p>
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {navigation.map(item => (
          <button
            type="button"
            key={item.id}
            className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
