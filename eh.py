import tkinter as tk
from tkinter import ttk
import threading
import time
from datetime import datetime
import subprocess
import platform

class StudyHelper:
    def __init__(self):
        self.active_reminders = {}
        self.reminder_threads = {}
        self.setup_main_window()
        
    def setup_main_window(self):
        """Create the main window"""
        self.root = tk.Tk()
        self.root.title("Study Helper")
        self.root.geometry("520x640")
        self.root.configure(bg='#2c3e50')
        
        # Main title
        title = tk.Label(self.root, text="📚 Study Helper", 
                        font=('Arial', 20, 'bold'), 
                        bg='#2c3e50', fg='white')
        title.pack(pady=18)
        
        # Built-in reminders frame
        self.create_builtin_section()
        
        # Custom reminders frame
        self.create_custom_section()
        
        # Status frame
        self.create_status_section()

        # Footer actions (Remind now / Quit)
        footer = tk.Frame(self.root, bg='#2c3e50')
        footer.pack(fill='x', pady=6)
        tk.Button(
            footer, text="🔔 Remind me now",
            command=lambda: self.show_reminder("Quick check-in: hydrate, stretch, and rest your eyes!"),
            bg='#8e44ad', fg='white', font=('Arial', 10, 'bold')
        ).pack(side='left', padx=20, pady=6)
        tk.Button(
            footer, text="✖ Quit",
            command=self.root.destroy,
            bg='#7f8c8d', fg='white', font=('Arial', 10, 'bold')
        ).pack(side='right', padx=20, pady=6)
        
    def create_builtin_section(self):
        """Create built-in reminders section"""
        frame = tk.LabelFrame(self.root, text="Built-in Reminders", 
                             font=('Arial', 12, 'bold'),
                             bg='#34495e', fg='white', 
                             bd=2, relief='groove')
        frame.pack(fill='x', padx=20, pady=10)

        # >>> Replaced with your requested list <<<
        reminders = [
            ("Hydrate", "💧", 30, "Time to hydrate! Drink some water."),
            ("Stand/Stretch", "🤸", 45, "Stand up and stretch your body."),
            ("Movement break", "🚶", 60, "Walk around for a minute."),
            ("Eye rest (20-20-20)", "👀", 20, "Look 20 ft away for 20s."),
            ("Pomodoro break", "⏱️", 25, "Take a short Pomodoro break."),
            ("Save your work", "💾", 15, "Save your work now."),
            ("Deep breathing", "🧘", 45, "Take a deep breathing break."),
        ]
        
        for name, emoji, minutes, msg in reminders:
            self.create_reminder_row(frame, name, emoji, minutes, msg)
    
    def _reminder_key(self, name, minutes):
        return f"{name}_{minutes}"

    def create_reminder_row(self, parent, name, emoji, minutes, message):
        """Create a row for each reminder"""
        row_frame = tk.Frame(parent, bg='#34495e')
        row_frame.pack(fill='x', padx=10, pady=6)
        
        # Emoji and name
        label = tk.Label(row_frame, text=f"{emoji} {name} (every {minutes} min)", 
                        font=('Arial', 11), bg='#34495e', fg='white')
        label.pack(side='left')
        
        # Toggle button
        button_text = tk.StringVar(value="Start")
        key = self._reminder_key(name, minutes)

        def toggle_reminder():
            if key in self.active_reminders:
                self.stop_reminder(key)
                button_text.set("Start")
            else:
                self.start_reminder(key, minutes, message)
                button_text.set("Stop")
                
        toggle_btn = tk.Button(row_frame, textvariable=button_text,
                              command=toggle_reminder,
                              bg='#27ae60', fg='white', 
                              font=('Arial', 9, 'bold'),
                              width=8)
        toggle_btn.pack(side='right', padx=4)

        # Special: "Just drank water (reset timer)" for Hydrate
        if name.lower().startswith("hydrate"):
            reset_btn = tk.Button(
                row_frame,
                text="Just drank water (reset)",
                command=lambda: self.reset_reminder(key),
                bg='#2980b9', fg='white',
                font=('Arial', 9, 'bold')
            )
            reset_btn.pack(side='right', padx=6)
        
    def create_custom_section(self):
        """Create custom reminders section"""
        frame = tk.LabelFrame(self.root, text="Custom Reminders", 
                             font=('Arial', 12, 'bold'),
                             bg='#34495e', fg='white', 
                             bd=2, relief='groove')
        frame.pack(fill='x', padx=20, pady=10)
        
        # Input fields
        input_frame = tk.Frame(frame, bg='#34495e')
        input_frame.pack(fill='x', padx=10, pady=10)
        
        tk.Label(input_frame, text="Name:", bg='#34495e', fg='white').grid(row=0, column=0, sticky='w')
        self.name_entry = tk.Entry(input_frame, width=20)
        self.name_entry.grid(row=0, column=1, padx=5)
        
        tk.Label(input_frame, text="Message:", bg='#34495e', fg='white').grid(row=1, column=0, sticky='w')
        self.msg_entry = tk.Entry(input_frame, width=30)
        self.msg_entry.grid(row=1, column=1, padx=5, pady=5)
        
        tk.Label(input_frame, text="Minutes:", bg='#34495e', fg='white').grid(row=2, column=0, sticky='w')
        self.min_entry = tk.Entry(input_frame, width=10)
        self.min_entry.grid(row=2, column=1, padx=5, sticky='w')
        
        # Add button
        add_btn = tk.Button(frame, text="➕ Add Custom Reminder", 
                           command=self.add_custom_reminder,
                           bg='#3498db', fg='white', 
                           font=('Arial', 10, 'bold'))
        add_btn.pack(pady=10)
        
        # Custom reminders list
        self.custom_frame = tk.Frame(frame, bg='#34495e')
        self.custom_frame.pack(fill='x', padx=10, pady=5)
        
    def create_status_section(self):
        """Create status section"""
        frame = tk.LabelFrame(self.root, text="Status", 
                             font=('Arial', 12, 'bold'),
                             bg='#34495e', fg='white', 
                             bd=2, relief='groove')
        frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Status text
        self.status_text = tk.Text(frame, height=8, bg='#2c3e50', fg='#ecf0f1',
                                  font=('Courier', 9))
        self.status_text.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Clear status button
        clear_btn = tk.Button(frame, text="Clear Status", 
                             command=lambda: self.status_text.delete(1.0, tk.END),
                             bg='#e74c3c', fg='white')
        clear_btn.pack(pady=5)
        
        # Initial status
        self.log_status("Study Helper started! Add reminders to begin.")
        
    def add_custom_reminder(self):
        """Add a custom reminder"""
        name = self.name_entry.get().strip()
        message = self.msg_entry.get().strip()
        
        try:
            minutes = int(self.min_entry.get().strip())
        except ValueError:
            self.log_status("❌ Please enter valid minutes!")
            return
            
        if not name or not message:
            self.log_status("❌ Please fill in all fields!")
            return
            
        # Clear entries
        self.name_entry.delete(0, tk.END)
        self.msg_entry.delete(0, tk.END)
        self.min_entry.delete(0, tk.END)
        
        # Create custom reminder row
        self.create_custom_row(name, message, minutes)
        self.log_status(f"✅ Added custom reminder: {name}")
        
    def create_custom_row(self, name, message, minutes):
        """Create a row for custom reminder"""
        row_frame = tk.Frame(self.custom_frame, bg='#34495e')
        row_frame.pack(fill='x', pady=2)
        
        # Name label
        label = tk.Label(row_frame, text=f"⭐ {name} (every {minutes} min)", 
                        font=('Arial', 10), bg='#34495e', fg='#f39c12')
        label.pack(side='left')
        
        # Button state
        button_text = tk.StringVar(value="Start")
        key = f"custom_{name}_{minutes}"
        
        def toggle_custom():
            if key in self.active_reminders:
                self.stop_reminder(key)
                button_text.set("Start")
            else:
                self.start_reminder(key, minutes, message)
                button_text.set("Stop")
        
        # Toggle button
        toggle_btn = tk.Button(row_frame, textvariable=button_text,
                              command=toggle_custom,
                              bg='#f39c12', fg='white', 
                              font=('Arial', 8, 'bold'),
                              width=6)
        toggle_btn.pack(side='right', padx=2)
        
        # Remove button
        remove_btn = tk.Button(row_frame, text="🗑️",
                              command=lambda: self.remove_custom_row(row_frame, key),
                              bg='#e74c3c', fg='white', 
                              font=('Arial', 8),
                              width=3)
        remove_btn.pack(side='right', padx=2)
        
    def remove_custom_row(self, row_frame, key):
        """Remove a custom reminder row"""
        # Stop reminder if running
        if key in self.active_reminders:
            self.stop_reminder(key)
        
        # Remove the visual row
        row_frame.destroy()
        self.log_status(f"🗑️ Removed custom reminder")
        
    def start_reminder(self, key, minutes, message):
        """Start a reminder timer"""
        self.active_reminders[key] = {
            'minutes': minutes,
            'message': message,
            'start_time': time.time()
        }
        
        # Start timer thread
        def timer_loop():
            while key in self.active_reminders:
                time.sleep(minutes * 60)  # Wait for specified minutes
                if key in self.active_reminders:  # Check if still active
                    self.show_reminder(message)
                    current_time = datetime.now().strftime("%H:%M")
                    self.log_status(f"🔔 {current_time} - {message}")
                    
        thread = threading.Thread(target=timer_loop, daemon=True)
        thread.start()
        self.reminder_threads[key] = thread
        
        start_time = datetime.now().strftime("%H:%M")
        self.log_status(f"▶️ {start_time} - Started reminder (every {minutes}min)")
        
    def stop_reminder(self, key):
        """Stop a reminder"""
        if key in self.active_reminders:
            del self.active_reminders[key]
        if key in self.reminder_threads:
            del self.reminder_threads[key]
        stop_time = datetime.now().strftime("%H:%M")
        self.log_status(f"⏹️ {stop_time} - Stopped reminder")

    def reset_reminder(self, key):
        """Reset a running reminder's timer (stop & restart with same settings)."""
        if key not in self.active_reminders:
            self.log_status("ℹ️ Hydrate reminder is not running; start it first.")
            return
        data = self.active_reminders[key]
        self.stop_reminder(key)
        self.start_reminder(key, data['minutes'], data['message'])
        self.log_status("🔄 Reset hydrate timer.")
        
    def show_reminder(self, message):
        """Show reminder notification"""
        try:
            system = platform.system().lower()
            
            if system == "windows":
                # Windows notification
                subprocess.run([
                    'powershell', '-Command',
                    f'Add-Type -AssemblyName System.Windows.Forms; '
                    f'[System.Windows.Forms.MessageBox]::Show("{message}", "Study Reminder", 0, 48)'
                ], check=False)
                
            elif system == "darwin":  # macOS
                subprocess.run([
                    'osascript', '-e', 
                    f'display notification "{message}" with title "Study Reminder"'
                ], check=False)
                
            elif system == "linux":
                subprocess.run(['notify-send', 'Study Reminder', message], check=False)
                
        except Exception:
            # Fallback: create popup window
            self.create_popup(message)
            
    def create_popup(self, message):
        """Create popup reminder window"""
        popup = tk.Toplevel(self.root)
        popup.title("Study Reminder")
        popup.geometry("300x150")
        popup.configure(bg='#e74c3c')
        popup.attributes('-topmost', True)
        
        # Center the popup
        popup.update_idletasks()
        x = (popup.winfo_screenwidth() // 2) - 150
        y = (popup.winfo_screenheight() // 2) - 75
        popup.geometry(f"300x150+{x}+{y}")
        
        tk.Label(popup, text="🔔 Reminder", 
                font=('Arial', 14, 'bold'), 
                bg='#e74c3c', fg='white').pack(pady=10)
        
        tk.Label(popup, text=message, 
                font=('Arial', 11), 
                bg='#e74c3c', fg='white',
                wraplength=250).pack(pady=10)
        
        tk.Button(popup, text="Got it!", 
                 command=popup.destroy,
                 bg='white', fg='#e74c3c',
                 font=('Arial', 10, 'bold')).pack(pady=10)
        
        # Auto-close after 10 seconds
        popup.after(10000, popup.destroy)
        
    def log_status(self, message):
        """Add message to status log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.status_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.status_text.see(tk.END)  # Scroll to bottom
        
    def run(self):
        """Start the application"""
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.root.quit()

def main():
    app = StudyHelper()
    app.run()

if __name__ == "__main__":
    main()
