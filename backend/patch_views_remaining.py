import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    verb_to_var = {
        '"PrePayment Reviewed"': 'prepayment',
        '"Payment/Finance Reviewed"': 'pf',
        '"Consumption Formula Created"': 'consumption',
        '"Consumption Formula Updated"': 'consumption',
        '"Raw Material Approved"': 'obj',
        '"Consumption Formula Approved"': 'obj',
        '"Product Formula Created"': 'formula',
        '"Product Formula Updated"': 'formula',
        '"Final Product Approved"': 'obj',
        '"Product Formula Approved"': 'obj',
    }
    
    pattern = re.compile(r'((\s+)NotificationService\.notify_users_explicit\([\s\S]*?verb=(["\'][^"\']+["\'])[\s\S]*?\))')
    
    def repl(match):
        full_match = match.group(1)
        indent = match.group(2)
        verb = match.group(3)
        
        var_name = verb_to_var.get(verb)
        # Check if already patched by looking before it (roughly)
        
        if var_name:
            insertion = f"{indent}if notified_user_ids and hasattr({var_name}, 'notified_users'):\n{indent}    {var_name}.notified_users.add(*notified_user_ids)\n"
            # we should check if the insertion is already there
            if "notified_users.add" in full_match:
                return full_match # theoretically full_match doesn't contain preceding lines
            return insertion + full_match
        else:
            return full_match
            
    # Check if we already patched some of these
    # Wait, the previous script only matched the ones it knew, and returned full_match for the rest. So they are unpatched.
    new_content = pattern.sub(repl, content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

patch_file('ktbv2/trademgt/views.py')
patch_file('ktbv2/costmgt/views.py')
print("Patching remaining complete.")
