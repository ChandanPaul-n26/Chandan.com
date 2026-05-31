
import tkinter as tk
from tkinter import ttk
import requests

def translate_and_save():
	text = input_box.get("1.0", tk.END).strip()
	target_lang = lang_var.get()
	if not text:
		output_box.delete("1.0", tk.END)
		output_box.insert(tk.END, "Please enter text to translate.")
		return
	url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={requests.utils.quote(text)}"
	import os
	try:
		response = requests.get(url)
		response.raise_for_status()
		data = response.json()
		translation = data[0][0][0]
		output_box.delete("1.0", tk.END)
		output_box.insert(tk.END, translation)
		# Always write to the correct Translator.txt in the script's directory
		script_dir = os.path.dirname(os.path.abspath(__file__))
		txt_path = os.path.join(script_dir, "Translator.txt")
		with open(txt_path, "a", encoding="utf-8") as f:
			f.write(f"Input: {text}\nOutput: {translation}\n---\n")
	except Exception as e:
		output_box.delete("1.0", tk.END)
		output_box.insert(tk.END, f"Error: {e}")

root = tk.Tk()
root.title("Translator App")

tk.Label(root, text="Enter text to translate:").pack()
input_box = tk.Text(root, height=4, width=50)
input_box.pack()

# Language dropdown
tk.Label(root, text="Select target language:").pack()
lang_var = tk.StringVar(value="en")
lang_options = [
	("English", "en"),
	("Japanese", "ja"),
	("German", "de"),
	("Bengali", "bn"),
	("Russian", "ru")
]
lang_menu = ttk.Combobox(root, textvariable=lang_var, values=[name for name, code in lang_options], state="readonly")
lang_menu.pack()

# Map display name to code
def on_lang_select(event):
	selected = lang_menu.get()
	for name, code in lang_options:
		if name == selected:
			lang_var.set(code)
			break
lang_menu.bind("<<ComboboxSelected>>", on_lang_select)
lang_menu.current(0)

translate_btn = ttk.Button(root, text="Translate", command=translate_and_save)
translate_btn.pack(pady=5)

tk.Label(root, text="Translation:").pack()
output_box = tk.Text(root, height=4, width=50)
output_box.pack()

root.mainloop()
