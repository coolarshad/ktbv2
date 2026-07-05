import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all instances of NotificationService.notify_users_explicit(
    # and insert `if notified_user_ids: <var>.notified_users.add(*notified_user_ids)` before it.
    
    # We will use a regex to match the NotificationService call and the preceding lines to guess the variable.
    # A simpler way: we know the variable names for each view.
    # TradeView -> trade
    # PreSalePurchaseView -> pre_sp
    # PreSalePurchaseApprove -> presp
    # PrePaymentView -> prepayment
    # SalesPurchaseView -> sp
    # PaymentFinanceView -> pf
    
    # Let's map target_urls or verbs to variables.
    verb_to_var = {
        '"Trade Created"': 'trade',
        '"Trade Updated"': 'trade',
        '"Trade Approved"': 'trade',
        '"Trade Reviewed"': 'trade',
        '"PreSalePurchase Created"': 'pre_sp',
        '"PreSalePurchase Updated"': 'pre_sp',
        '"PreSalePurchase Approved"': 'presp',
        '"PrePayment Created"': 'prepayment',
        '"PrePayment Updated"': 'prepayment',
        '"PrePayment Approved"': 'prepayment',
        '"SalesPurchase Created"': 'sp',
        '"SalesPurchase Updated"': 'sp',
        '"SalesPurchase Approved"': 'sp',
        '"PaymentFinance Created"': 'pf',
        '"PaymentFinance Updated"': 'pf',
        '"PaymentFinance Approved"': 'pf',
        
        '"RawMaterial Created"': 'rm',
        '"RawMaterial Updated"': 'rm',
        '"RawMaterial Approved"': 'rm',
        '"Additive Created"': 'additive',
        '"Additive Updated"': 'additive',
        '"Additive Approved"': 'additive',
        '"Packing Created"': 'packing',
        '"Packing Updated"': 'packing',
        '"Packing Approved"': 'packing',
        '"Consumption Created"': 'consumption',
        '"Consumption Updated"': 'consumption',
        '"Consumption Approved"': 'consumption',
        '"ConsumptionFormula Created"': 'consumption_formula',
        '"ConsumptionFormula Updated"': 'consumption_formula',
        '"ConsumptionFormula Approved"': 'consumption_formula',
        '"ProductFormula Created"': 'formula',
        '"ProductFormula Updated"': 'formula',
        '"ProductFormula Approved"': 'formula',
        '"FinalProduct Created"': 'final_product',
        '"FinalProduct Updated"': 'final_product',
        '"FinalProduct Approved"': 'final_product',
    }
    
    pattern = re.compile(r'((\s+)NotificationService\.notify_users_explicit\([\s\S]*?verb=(["\'][^"\']+["\'])[\s\S]*?\))')
    
    def repl(match):
        full_match = match.group(1)
        indent = match.group(2)
        verb = match.group(3)
        
        var_name = verb_to_var.get(verb)
        if var_name:
            insertion = f"{indent}if notified_user_ids:\n{indent}    {var_name}.notified_users.add(*notified_user_ids)\n"
            return insertion + full_match
        else:
            print(f"Warning: No var mapping for verb {verb}")
            return full_match
            
    new_content = pattern.sub(repl, content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

patch_file('ktbv2/trademgt/views.py')
patch_file('ktbv2/costmgt/views.py')
print("Patching complete.")
