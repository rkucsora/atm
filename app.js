class App {
	constructor() {
		this.withdrawals = parse(localStorage.getItem("withdrawals"));
		this.updateMessage();
		this.withdrawals.forEach(w => this.addWithdrawal(w.time, w.amount));
		document.getElementById("inputForm").addEventListener("submit", e => this.onSubmit(e));
	}
	
	updateMessage() {
		const allowed = canWithdraw(this.withdrawals);
		if (allowed) {
			document.getElementById("messageAllowed").classList.add("visible");
			document.getElementById("messageNotAllowed").classList.remove("visible");
		} else {
			document.getElementById("messageAllowed").classList.remove("visible");
			document.getElementById("messageNotAllowed").classList.add("visible");
		}
	}

	addWithdrawal(time, amount) {
		const timeStr = new Intl.DateTimeFormat("hu-HU", {dateStyle: "short", timeStyle: "short"}).format(time);
		const container = document.getElementById("withdrawals");
		const row = document.createElement("div");
		row.classList.add("row");
		container.appendChild(row);

		const timeBox = document.createElement("div");
		timeBox.classList.add("cell");
		timeBox.innerText = timeStr;
		row.appendChild(timeBox);

		const amountBox = document.createElement("div");
		amountBox.classList.add("cell");
		amountBox.innerText = amount + " Ft";
		row.appendChild(amountBox);

		const delButton = document.createElement("a");
		delButton.href="#";
		delButton.classList.add("del");
		delButton.innerText="🗑️";
		amountBox.appendChild(delButton);
		delButton.addEventListener("click", e => this.onDelete(e, row, time, amount));
	}

	onSubmit(e) {
		e.preventDefault();
		const amount = document.getElementById("amount").value;
		const time = new Date();
		this.addWithdrawal(time, amount);
		this.withdrawals.push({time: time, amount: amount});
		localStorage.setItem("withdrawals", serialize(this.withdrawals));
		this.updateMessage();
		document.getElementById("amount").value = "";
	}

	onDelete(e, row, time, amount) {
		e.preventDefault();
		// FIXME what if multiple entries have the same time and amount?
		this.withdrawals = this.withdrawals.filter(x => x.time != time || x.amount != amount);
		localStorage.setItem("withdrawals", serialize(this.withdrawals));
		row.remove();
		this.updateMessage();
	}

}

function parse(eventData) {
	if (eventData == null) {
		return [];
	} else {
		const now = new Date();
		const monthFirstDay = new Date(now.getFullYear(), now.getMonth());
		return eventData.split(";").map(s => {
			const parts = s.split("@");
			return {
				amount: Number(parts[0]),
				time: new Date(parts[1])
			};
		}).filter(e => e.time >= monthFirstDay);
	}	
}

function canWithdraw(events) {
	if (events.length >= 2) {
		return false;
	}
	const sum = events.reduce((acc, cur) => acc + cur.amount, 0);
	if (sum >= 150000) {
		return false;
	}
	return true;
}

function serialize(events) {
	return events
		.map(e => e.amount + "@" + e.time.toISOString())
		.join(";");
}

window.addEventListener('load', function() { new App(); }, false);