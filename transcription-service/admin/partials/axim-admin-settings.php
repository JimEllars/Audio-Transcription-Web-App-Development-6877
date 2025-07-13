<div class="wrap axim-admin-wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <form method="post" action="options.php" class="axim-form">
        <?php
        settings_fields('axim_transcription_settings');
        do_settings_sections('axim_transcription_settings');
        ?>

        <div class="axim-form-group">
            <h2>Tracking Configuration</h2>
            
            <label for="axim_tracking_id">Google Analytics ID</label>
            <input 
                type="text" 
                id="axim_tracking_id" 
                name="axim_tracking_id" 
                value="<?php echo esc_attr(get_option('axim_tracking_id')); ?>"
                class="axim-input"
            >

            <label for="axim_pixel_id">Facebook Pixel ID</label>
            <input 
                type="text" 
                id="axim_pixel_id" 
                name="axim_pixel_id" 
                value="<?php echo esc_attr(get_option('axim_pixel_id')); ?>"
                class="axim-input"
            >
        </div>

        <div class="axim-form-group">
            <h2>Supabase Configuration</h2>
            
            <label for="axim_supabase_url">Supabase URL</label>
            <input 
                type="text" 
                id="axim_supabase_url" 
                name="axim_supabase_url" 
                value="<?php echo esc_attr(get_option('axim_supabase_url')); ?>"
                class="axim-input"
            >

            <label for="axim_supabase_key">Supabase Anon Key</label>
            <input 
                type="password" 
                id="axim_supabase_key" 
                name="axim_supabase_key" 
                value="<?php echo esc_attr(get_option('axim_supabase_key')); ?>"
                class="axim-input"
            >
        </div>

        <div class="axim-form-group">
            <h2>Widget Settings</h2>
            
            <label for="axim_default_theme">Default Theme</label>
            <select 
                id="axim_default_theme" 
                name="axim_default_theme" 
                class="axim-input"
            >
                <option value="light" <?php selected(get_option('axim_default_theme'), 'light'); ?>>Light</option>
                <option value="dark" <?php selected(get_option('axim_default_theme'), 'dark'); ?>>Dark</option>
            </select>

            <label for="axim_default_plan">Default Plan</label>
            <select 
                id="axim_default_plan" 
                name="axim_default_plan" 
                class="axim-input"
            >
                <option value="basic" <?php selected(get_option('axim_default_plan'), 'basic'); ?>>Basic</option>
                <option value="student" <?php selected(get_option('axim_default_plan'), 'student'); ?>>Student</option>
                <option value="business" <?php selected(get_option('axim_default_plan'), 'business'); ?>>Business</option>
            </select>
        </div>

        <?php submit_button('Save Settings', 'axim-button'); ?>
    </form>
</div>